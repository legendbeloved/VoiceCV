import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Edit3, Save, X, Bold, Italic, List, AlignLeft, Undo, Redo, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import Markdown from 'react-markdown';

interface LiveResumePreviewProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export default function LiveResumePreview({ content, onSave, onCancel }: LiveResumePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    setEditableContent(content);
    setHistory([content]);
    setHistoryIndex(0);
  }, [content]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editableContent);
    setIsEditing(false);
    addToHistory(editableContent);
  };

  const handleCancel = () => {
    setEditableContent(content);
    setIsEditing(false);
    onCancel();
  };

  const addToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditableContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditableContent(history[newIndex]);
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'list' | 'heading') => {
    const textarea = document.getElementById('resume-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editableContent.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        break;
    }

    const newContent = editableContent.substring(0, start) + formattedText + editableContent.substring(end);
    setEditableContent(newContent);
    addToHistory(newContent);
  };

  return (
    <div className={`flex flex-col gap-4 ${isFullscreen ? 'fixed inset-4 z-50 bg-[var(--bg)]' : ''}`}>
      <Card variant="solid" padding="lg" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-[var(--text)]">Resume Preview</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              leftIcon={isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              leftIcon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            />
          </div>
        </div>

        {isEditing ? (
          <div className="flex-1 flex flex-col gap-4">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('bold')}
                leftIcon={<Bold size={16} />}
                title="Bold"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('italic')}
                leftIcon={<Italic size={16} />}
                title="Italic"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('list')}
                leftIcon={<List size={16} />}
                title="Bullet List"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('heading')}
                leftIcon={<AlignLeft size={16} />}
                title="Heading"
              />
              <div className="w-px h-6 bg-[var(--border)] mx-2" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex === 0}
                leftIcon={<Undo size={16} />}
                title="Undo"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                leftIcon={<Redo size={16} />}
                title="Redo"
              />
            </div>

            {/* Editor */}
            <textarea
              id="resume-editor"
              value={editableContent}
              onChange={(e) => {
                setEditableContent(e.target.value);
              }}
              onBlur={() => addToHistory(editableContent)}
              className="flex-1 min-h-96 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] resize-y font-mono"
              placeholder="Edit your resume content here..."
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleSave} leftIcon={<Save size={16} />}>Save Changes</Button>
              <Button variant="ghost" onClick={handleCancel} leftIcon={<X size={16} />}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 overflow-auto prose prose-sm max-w-none text-[var(--text)]">
            <Markdown>
              {editableContent}
            </Markdown>
          </div>
        )}
      </Card>
    </div>
  );
}
