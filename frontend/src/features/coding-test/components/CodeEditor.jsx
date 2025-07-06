import React, { useState, useEffect, useRef } from 'react';
import Editor, { useMonaco, loader } from '@monaco-editor/react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

// Configure Monaco Editor loader to use a CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs',
  },
});

// Define a custom futuristic theme for the editor
const defineFuturisticTheme = (monaco) => {
  monaco.editor.defineTheme('futuristic-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a9955' },
      { token: 'keyword', foreground: 'c586c0', fontStyle: 'bold' }, // Purple keywords
      { token: 'number', foreground: 'b5cea8' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'operator', foreground: 'd4d4d4' },
      { token: 'identifier', foreground: '9cdcfe' }, // Light blue for variables/identifiers
      { token: 'type.identifier', foreground: '4ec9b0' }, // Teal for types
      { token: 'delimiter', foreground: 'd4d4d4' },
      { token: 'function', foreground: 'dcdcaa' }, // Yellow for functions
      { token: 'constant', foreground: '4fc1ff' },
      { token: 'predefined', foreground: 'd7ba7d' },
    ],
    colors: {
      'editor.background': '#0A0F18', // Dark background matching the app
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': alpha('#0064ff', 0.1), // Match primary color glow
      'editorCursor.foreground': '#00AFFF', // Bright cursor
      'editorWhitespace.foreground': '#3B3A3A',
      'editor.selectionBackground': alpha('#0064ff', 0.3),
      'editorSuggestWidget.background': '#1A1F28',
      'editorSuggestWidget.border': alpha('#0064ff', 0.5),
      'editorHoverWidget.background': '#1A1F28',
      'editorHoverWidget.border': alpha('#0064ff', 0.5),
    },
  });
};

/**
 * CodeEditor - A futuristic, themed code editor component using Monaco.
 *
 * @param {Object} props
 * @param {string} props.language - The currently selected programming language.
 * @param {function(string): void} props.onLanguageChange - Callback for when the language changes.
 * @param {string} props.code - The current code content.
 * @param {function(string): void} props.onCodeChange - Callback for when the code content changes.
 * @param {Array<string>} props.supportedLanguages - A list of languages supported by the current challenge.
 * @param {function(function): void} props.onPaste - Callback to handle paste events for anti-cheat.
 */
const CodeEditor = ({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  supportedLanguages = ['python', 'javascript'],
  onPaste,
}) => {
  const theme = useTheme();
  const monaco = useMonaco();
  const editorRef = useRef(null);

  // Define the custom theme once Monaco is loaded
  useEffect(() => {
    if (monaco) {
      defineFuturisticTheme(monaco);
    }
  }, [monaco]);

  // Handle the mounting of the editor to attach event listeners
  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    // Attach paste event listener for anti-cheat
    if (onPaste) {
      editor.onDidPaste(() => {
        onPaste();
      });
    }
  };

  const handleCodeChange = (value) => {
    onCodeChange(value || '');
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.3),
        background: 'rgba(10, 15, 24, 0.9)', // Slightly different from paper for depth
        overflow: 'hidden',
      }}
    >
      {/* Header with Language Selector */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          background: alpha('#000', 0.2),
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.3),
        }}
      >
        <FormControl size="small" variant="outlined">
          <InputLabel
            id="language-select-label"
            sx={{ color: 'text.secondary' }}
          >
            Language
          </InputLabel>
          <Select
            labelId="language-select-label"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            label="Language"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              minWidth: 140,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.5),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
              },
            }}
          >
            {supportedLanguages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Monaco Editor Instance */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language={language}
          value={code}
          theme={monaco ? 'futuristic-dark' : 'vs-dark'}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          loading={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                Initializing IDE...
              </Typography>
            </Box>
          }
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'boundary',
            cursorBlinking: 'smooth',
            cursorStyle: 'line-thin',
            smoothScrolling: true,
          }}
        />
      </Box>
    </Box>
  );
};

export default CodeEditor;
