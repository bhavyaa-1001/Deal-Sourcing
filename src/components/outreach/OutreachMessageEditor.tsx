import React, { useState, useEffect } from 'react';
import type { OutreachScript, OutreachChannel } from '../../types';
import Button from '../ui/Button';
import { Copy, CheckCheck, RefreshCw } from 'lucide-react';

interface Props {
  script: OutreachScript;
  channel: OutreachChannel;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onEdit: (subject: string, body: string) => void;
}

const OutreachMessageEditor: React.FC<Props> = ({
  script,
  channel,
  isRegenerating,
  onRegenerate,
  onEdit,
}) => {
  const [subject, setSubject] = useState(script.subject);
  const [body, setBody] = useState(script.body);
  const [copied, setCopied] = useState(false);

  // Sync when script changes (different script type or company)
  useEffect(() => {
    setSubject(script.subject);
    setBody(script.body);
  }, [script.subject, script.body]);

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    onEdit(val, body);
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    onEdit(subject, val);
  };

  const handleCopy = async () => {
    try {
      const text =
        channel === 'email' && subject
          ? `Subject: ${subject}\n\n${body}`
          : body;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for environments without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = body;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* Subject — only for email */}
      {channel === 'email' && (
        <div>
          <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            disabled={isRegenerating}
            className="
              w-full px-4 py-3 border border-default rounded-lg bg-card text-primary
              font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40
              disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-slate-900 dark:border-slate-700
            "
            placeholder="Message subject line"
          />
        </div>
      )}

      {/* Message body */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
          Message
        </label>
        <textarea
          value={body}
          onChange={(e) => handleBodyChange(e.target.value)}
          disabled={isRegenerating}
          rows={channel === 'linkedin' ? 10 : 14}
          className="
            w-full px-4 py-3.5 border border-default rounded-lg bg-card text-primary
            text-sm leading-relaxed font-normal resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary/40
            disabled:opacity-50 disabled:cursor-not-allowed
            dark:bg-slate-900 dark:border-slate-700
            font-mono
          "
          placeholder="Message body will appear here after generation..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />}
        >
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCopy}
          disabled={isRegenerating || !body}
          leftIcon={copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        >
          {copied ? 'Copied!' : 'Copy Message'}
        </Button>
      </div>
    </div>
  );
};

export default OutreachMessageEditor;
