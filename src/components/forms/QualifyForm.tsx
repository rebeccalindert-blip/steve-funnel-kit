import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/cn';
import { inputVariants } from '@/components/ui/form/Input/input.variants';
import { selectVariants } from '@/components/ui/form/Select/select.variants';
import { buttonVariants } from '@/components/ui/form/Button/button.variants';

interface Question {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface Props {
  questions?: Question[];
  submitLabel?: string;
  successHeading?: string;
  successMessage?: string;
  successLinkUrl?: string;
  successLinkLabel?: string;
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    name: 'biggest_challenge',
    label: "What's your biggest challenge right now?",
    type: 'textarea',
    placeholder: 'Tell us in a sentence or two…',
    required: true,
  },
  {
    name: 'revenue_range',
    label: 'Monthly revenue range',
    type: 'select',
    options: ['Not yet launched', 'Under $5k/mo', '$5k–$20k/mo', '$20k–$100k/mo', '$100k+/mo'],
    required: true,
  },
  {
    name: 'how_found',
    label: 'How did you hear about us?',
    type: 'select',
    options: ['LinkedIn', 'Google', 'Referral', 'Social media', 'Other'],
    required: true,
  },
];

export default function QualifyForm({
  questions = DEFAULT_QUESTIONS,
  submitLabel = 'Submit',
  successHeading = "You're in.",
  successMessage = "We've got everything we need. Check your inbox for next steps.",
  successLinkUrl = '/',
  successLinkLabel = 'Back to homepage',
}: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Read email from URL
  const email = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('email') || ''
    : '';

  const handleChange = (name: string, value: string) => {
    setResponses((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    for (const q of questions) {
      if (q.required && (!responses[q.name] || responses[q.name].trim() === '')) {
        newErrors[q.name] = 'Required';
      }
    }
    if (!email) newErrors._email = 'Missing email — go back to step 1';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, responses }),
      });

      if (!res.ok) {
        toast.error('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        toast.success('Got it.');
      } else {
        toast.error(result.message || 'Something went wrong.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = cn(inputVariants({ size: 'md' }), 'px-4 dark:bg-card');
  const selectClasses = cn(selectVariants({ size: 'md' }), 'dark:bg-card');
  const textareaClasses = cn(inputVariants({ size: 'md' }), 'px-4 dark:bg-card h-auto py-3');
  const submitClasses = cn(buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true }), '!mt-6');

  if (success) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--brand-100)' }}>
          <svg className="h-8 w-8" style={{ color: 'var(--brand-700)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          {successHeading}
        </h1>
        <p className="text-base max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
          {successMessage}
        </p>
        {successLinkUrl && (
          <a
            href={successLinkUrl}
            className={cn(buttonVariants({ variant: 'secondary', size: 'md' }), 'mt-4 inline-flex')}
          >
            {successLinkLabel}
          </a>
        )}
      </div>
    );
  }

  return (
    <>
      <Toaster toastOptions={{ duration: 5000 }} position="top-center" reverseOrder={false} />
      {errors._email && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm">
          {errors._email}. <a href="/form" className="underline font-medium">Go back →</a>
        </div>
      )}
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {questions.map((q) => (
          <div key={q.name}>
            <label className="block mb-2 text-sm font-medium text-[var(--foreground)]">
              {q.label} {q.required && <span className="text-[var(--error)]">*</span>}
            </label>
            {q.type === 'select' ? (
              <select
                value={responses[q.name] || ''}
                onChange={(e) => handleChange(q.name, e.target.value)}
                className={selectClasses}
              >
                <option value="">Select…</option>
                {q.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : q.type === 'textarea' ? (
              <textarea
                value={responses[q.name] || ''}
                onChange={(e) => handleChange(q.name, e.target.value)}
                placeholder={q.placeholder}
                rows={3}
                className={textareaClasses}
              />
            ) : (
              <input
                type="text"
                value={responses[q.name] || ''}
                onChange={(e) => handleChange(q.name, e.target.value)}
                placeholder={q.placeholder}
                className={inputClasses}
              />
            )}
            {errors[q.name] && (
              <div className="mt-1 text-sm text-[var(--error)]">{errors[q.name]}</div>
            )}
          </div>
        ))}

        <button type="submit" disabled={loading} className={submitClasses}>
          {loading ? 'Submitting…' : submitLabel}
        </button>
      </form>
    </>
  );
}
