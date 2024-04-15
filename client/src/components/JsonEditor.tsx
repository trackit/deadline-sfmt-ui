import React from 'react';
import Editor, { loader } from '@monaco-editor/react';

loader.init().then((monaco) => {
    monaco.editor.defineTheme('myTheme', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'string.value.json', foreground: '#d19a66' },
            { token: 'string.key.json', foreground: '#004785', fontStyle: 'bold' },
            { token: 'number.json', foreground: '#d19a66' },
            { token: 'boolean.json', foreground: '#042b4e' },
        ],
        colors: {
            'editor.background': '#ffffff',
        },
    });
});

interface JsonEditorProps {
    initialValue: string;
    onChange: (newValue: string) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ initialValue, onChange }) => {
    const handleEditorChange = (newValue: string | undefined) => {
        if (newValue)
            onChange(newValue);
    };

    return (
        <Editor
            theme='myTheme'
            height='76vh'
            language="json"
            value={initialValue}
            options={{ selectOnLineNumbers: true, automaticLayout: true, scrollBeyondLastLine: false }}
            onChange={handleEditorChange}
        />
    );
};

export default JsonEditor;