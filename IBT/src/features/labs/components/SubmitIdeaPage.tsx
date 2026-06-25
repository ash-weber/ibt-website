'use client';

import { IdeaSubmissionForm } from './IdeaSubmissionForm';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export function SubmitIdeaPage() {
  return (
    <div className="bg-[#f8faff] min-h-screen pt-16 pb-10 font-sans">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 max-w-3xl mx-auto">
          <Link 
            href="/ibt-labs" 
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#e63946] transition-colors mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to IBT Labs
          </Link>
          
          <div className="text-center mb-6">
            <h1 className="text-[28px] sm:text-[36px] font-black tracking-tight text-[#0f172a] mb-2">
              Share your idea with us
            </h1>
            <p className="text-[16px] text-slate-500 font-medium">
              We'd love to hear what you're thinking. Submit your idea below — our team reviews every submission.
            </p>
          </div>
        </div>

        <IdeaSubmissionForm />
        
      </div>
    </div>
  );
}
