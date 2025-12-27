import React, { useState } from 'react';
import { llmService } from '../services/LLMService';

export const DebugPanel: React.FC = () => {
    const [status, setStatus] = useState('Idle');
    const [log, setLog] = useState<string[]>([]);

    const testConnection = async () => {
        setStatus('Testing...');
        setLog([]);
        try {
            // @ts-ignore
            if (!llmService.client) {
                setLog(prev => [...prev, "Client not initialized. Check ai.yaml loading."]);
                // @ts-ignore
                if (llmService.config) {
                    // @ts-ignore
                    setLog(prev => [...prev, `Config loaded: ${JSON.stringify(llmService.config)}`]);
                } else {
                    setLog(prev => [...prev, "Config is NULL."]);
                }
                setStatus('Failed');
                return;
            }

            setLog(prev => [...prev, "Client initialized. Sending test request..."]);
            const response = await llmService.generateCompletion([
                { role: 'user', content: 'Say "Hello World"' }
            ]);

            if (response) {
                setLog(prev => [...prev, `Success: ${response}`]);
                setStatus('Success');
            } else {
                // @ts-ignore
                const err = llmService.getLastError?.() || "Unknown error";
                setLog(prev => [...prev, `Received null response. Last Error: ${err}`]);
                setStatus('Failed');
            }

        } catch (e: any) {
            setLog(prev => [...prev, `Exception: ${e.message}`]);
            setStatus('Error');
        }
    };

    const testRawFetch = async () => {
        setStatus('Testing Raw Fetch...');
        // @ts-ignore
        if (!llmService.config) {
            setLog(prev => [...prev, "Config not loaded."]);
            return;
        }

        try {
            // @ts-ignore
            const config = llmService.config.llm;
            // Use PROXY URL for raw test
            const url = '/api/proxy/v1/chat/completions';
            const apiKey = config.openai_api_key;
            const model = config.model1;

            setLog(prev => [...prev, `Fetching: ${url}`]);
            setLog(prev => [...prev, `Model: ${model}`]);

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: 'ping' }],
                    max_completion_tokens: 5
                })
            });

            setLog(prev => [...prev, `Status: ${res.status} ${res.statusText}`]);

            if (!res.ok) {
                const errText = await res.text();
                setLog(prev => [...prev, `Error Body: ${errText.slice(0, 100)}...`]);
            } else {
                const data = await res.json();
                setLog(prev => [...prev, `Response: ${JSON.stringify(data).slice(0, 100)}...`]);
            }

        } catch (e: any) {
            setLog(prev => [...prev, `Fetch Error: ${e.message}`]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 0, left: 0, padding: 10, background: 'rgba(0,0,0,0.8)', color: 'lime', zIndex: 9999, width: '100%', maxHeight: '200px', overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 5 }}>
                <button onClick={testConnection}>Test SDK</button>
                <button onClick={testRawFetch}>Test Raw Fetch</button>
                <span>Status: {status}</span>
            </div>
            {log.map((l, i) => <div key={i} style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{l}</div>)}
        </div>
    );
};
