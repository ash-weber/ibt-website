'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiUser,
  FiCheckCircle,
  FiLoader,
  FiSend,
  FiCode,
  FiBriefcase,
  FiStar,
  FiUploadCloud,
  FiUsers,
  FiTrendingUp,
  FiLock,
  FiInfo
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from '@/src/components/Toast';

export default function InternshipApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    about: '',
    skills: '',
    jobType: '',
    applicationType: 'Internship',
    otp: ''
  });
  const [resume, setResume] = useState<File | null>(null);

  const [toast, setToast] = useState({
    open: false,
    message: '',
    variant: 'success' as 'success' | 'error'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'phone') {
      finalValue = value.replace(/[^\d+]/g, '');
    } else if (name === 'name') {
      finalValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'email') {
      finalValue = value.replace(/[^a-zA-Z0-9@.]/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      showToast('Only document files (PDF, DOC, DOCX) are allowed. Images are not permitted.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size should be less than 5MB', 'error');
      return;
    }
    setResume(file);
  };

  const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
    setToast({ open: true, message, variant });
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please fill the Full Name field', 'error');
      return;
    }
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.name.trim())) {
      showToast('Full Name must contain only letters and spaces', 'error');
      return;
    }

    if (!formData.email.trim()) {
      showToast('Please fill the Email Address field', 'error');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      showToast('Please enter a valid email address containing "@"', 'error');
      return;
    }

    if (!formData.phone.trim()) {
      showToast('Please fill the Phone Number field', 'error');
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 12) {
      showToast('Phone number must be between 10 and 12 digits', 'error');
      return;
    }

    if (!formData.jobType) {
      showToast('Please select a Role / Interest', 'error');
      return;
    }

    if (!formData.skills.trim()) {
      showToast('Please fill the Key Technical Skills field', 'error');
      return;
    }

    if (!formData.about.trim()) {
      showToast('Please fill the Cover Letter / About You field', 'error');
      return;
    }
    const wordCount = formData.about.trim().split(/\s+/).length;
    if (wordCount < 20) {
      showToast(`Cover letter must be at least 20 words (currently ${wordCount})`, 'error');
      return;
    }

    if (!resume) {
      showToast('Please upload your Resume', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internship/v1/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');

      showToast('OTP sent to your email');
      setStep(2);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) {
      showToast('Please enter the OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      if (resume) {
        payload.append('resume', resume);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internship/v1/submit/internship`, {
        method: 'POST',
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');

      showToast('Application submitted successfully!');
      setTimeout(() => {
        router.push('/internship');
      }, 2000);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] font-sans pb-24 relative overflow-hidden">
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      />

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-gradient-to-bl from-slate-100 to-transparent -z-10 opacity-60" />

      <div className="mx-auto w-full max-w-[1300px] px-4 pt-10 sm:px-6 lg:px-8">

        {/* =========================================
            HEADER SECTION (Matches exact layout)
        ========================================= */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="max-w-xl">
            <button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 text-[13px] font-bold text-[#e63946] hover:text-red-700 transition-colors mb-6"
            >
              <FiArrowLeft className="transition-transform group-hover:-translate-x-1" size={16} /> Back to Internship
            </button>
            <h1 className="text-[40px] sm:text-[48px] lg:text-[54px] font-black tracking-tight text-[#0f172a] leading-[1.1] mb-4">
              Application Form
            </h1>
            <p className="text-[17px] text-slate-500 font-medium leading-relaxed max-w-lg">
              Fill in the details below to submit your application for internship opportunities at IBT.
            </p>
          </div>

          {/* SVG Illustration Representation */}
          <div className="hidden md:flex relative w-[240px] h-[220px] items-center justify-center shrink-0">
            {/* Background elements */}
            <div className="absolute w-[200px] h-[200px] bg-slate-100/50 rounded-full blur-2xl"></div>
            <div className="absolute top-10 left-0 w-2 h-2 rounded-full bg-red-400"></div>
            <div className="absolute top-20 right-4 w-2 h-2 rounded-full bg-red-400"></div>

            {/* Clipboard Graphic */}
            <div className="relative z-10 w-[140px] h-[180px] bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col items-center pt-8 pb-4 px-4">
              {/* Clip */}
              <div className="absolute -top-3 w-16 h-6 bg-slate-300 rounded-lg flex justify-center">
                <div className="w-8 h-3 bg-slate-400 rounded-b-md"></div>
              </div>

              {/* Profile area inside clipboard */}
              <div className="flex items-center gap-3 w-full mb-6">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                  {/* User Silhouette SVG */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mt-2"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                </div>
                <div className="space-y-2 w-full">
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                  <div className="h-2 bg-slate-100 rounded w-2/3"></div>
                </div>
              </div>

              {/* Lines */}
              <div className="w-full space-y-3">
                <div className="h-2 bg-slate-100 rounded w-full"></div>
                <div className="h-2 bg-slate-100 rounded w-full"></div>
                <div className="h-2 bg-slate-100 rounded w-4/5"></div>
              </div>

              {/* Red Checkmark Bubble */}
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#e63946] rounded-full flex items-center justify-center text-white shadow-lg border-[3px] border-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            MAIN CARD WRAPPER
        ========================================= */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-3 lg:p-4 flex flex-col lg:flex-row gap-4 lg:gap-8 min-h-[800px]">

          {/* -------------------------------------
              LEFT PANEL (DARK BLUE SIDEBAR)
          ------------------------------------- */}
          <div className="bg-[#0f172a] rounded-[2rem] w-full lg:w-[420px] shrink-0 p-8 sm:p-10 lg:p-12 flex flex-col relative overflow-hidden">
            {/* Background Texture Overlay (Subtle dots) */}
            <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_bottom_right,black,transparent_70%)] pointer-events-none"></div>

            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm">
                <FiStar className="text-[#e63946]" size={20} />
              </div>

              <h2 className="text-[32px] sm:text-[36px] font-black !text-white leading-[1.1] mb-6 tracking-tight">
                Start Your <span className="text-[#e63946]">Career Journey</span>
              </h2>

              <p className="text-[15px] text-slate-300 font-medium leading-relaxed mb-12 max-w-none lg:max-w-sm">
                Join our innovative team at IBT. We're looking for passionate individuals ready to make an impact.
              </p>

              <div className="space-y-8">
                {/* Feature 1 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <FiBriefcase className="text-[#e63946]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold !text-white mb-1">Real-world Projects</h4>
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-none lg:max-w-[200px]">
                      Work on things that matter.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <FiUsers className="text-[#e63946]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold !text-white mb-1">Expert Mentorship</h4>
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-none lg:max-w-[200px]">
                      Learn from industry experts.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <FiTrendingUp className="text-[#e63946]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold !text-white mb-1">Career Growth</h4>
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-none lg:max-w-[200px]">
                      Opportunities to learn, grow and lead.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Box at bottom */}
            <div className="relative z-10 mt-12 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <span className="absolute top-4 left-4 text-4xl text-white/10 font-serif leading-none">"</span>
              <p className="text-[13px] text-slate-300 font-medium leading-relaxed mb-4 relative z-10 pl-4 pt-1">
                The IBT internship gave me hands-on experience and helped me grow as a professional.
              </p>
              <div className="pl-4 font-bold text-[13px] text-[#e63946]">
                - IBT Intern
              </div>
            </div>
          </div>

          {/* -------------------------------------
              RIGHT PANEL (FORM AREA)
          ------------------------------------- */}
          <div className="flex-1 py-8 px-4 sm:px-8 lg:px-12">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleRequestOTP}
                  noValidate
                  className="max-w-3xl"
                >

                  {/* Section 1: Personal Information */}
                  <div className="mb-10">
                    <h3 className="text-[18px] font-black text-[#0f172a] mb-2">Personal Information</h3>
                    <div className="h-1 w-8 bg-[#e63946] rounded-full mb-8"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">

                      {/* Full Name */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Full Name <span className="text-red-500 ml-1">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <FiUser size={16} />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Eg. John Doe"
                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e63946] transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Email Address <span className="text-red-500 ml-1">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <FiMail size={16} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Eg. john@example.com"
                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e63946] transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Phone Number <span className="text-red-500 ml-1">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <FiPhone size={16} />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            maxLength={12}
                            placeholder="Eg. +91 98765 43210"
                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e63946] transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Applying For */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Applying For <span className="text-red-500 ml-1">*</span></label>
                        <div className="relative">
                          <select
                            name="applicationType"
                            value={formData.applicationType}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e63946] transition-all shadow-sm appearance-none"
                          >
                            <option value="Internship">Internship</option>
                            <option value="Job">Full-time Job</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                          </div>
                        </div>
                      </div>

                      {/* Role / Interest */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Role / Interest <span className="text-red-500 ml-1">*</span></label>
                        <div className="relative">
                          <select
                            name="jobType"
                            value={formData.jobType}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e63946] transition-all shadow-sm appearance-none"
                          >
                            <option value="" disabled>Select Option</option>
                            <option value="Full Stack Development">Full Stack Development</option>
                            <option value="Frontend Development">Frontend Development</option>
                            <option value="Backend Development">Backend Development</option>
                            <option value="UI/UX Design">UI/UX Design</option>
                            <option value="Cyber Security">Cyber Security</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Cloud Computing">Cloud Computing</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                          </div>
                        </div>
                      </div>

                      {/* Key Technical Skills */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">Key Technical Skills <span className="text-red-500 ml-1">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <FiCode size={16} />
                          </div>
                          <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleInputChange}
                            required
                            placeholder="Eg. React, Node.js, UI Design"
                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e63946] transition-all shadow-sm"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Section 2: About You */}
                  <div className="mb-10">
                    <h3 className="text-[18px] font-black text-[#0f172a] mb-2">About You</h3>
                    <div className="h-1 w-8 bg-[#e63946] rounded-full mb-8"></div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[13px] font-bold text-slate-700">Cover Letter / About You <span className="text-red-500 ml-1">*</span></label>
                        <span className="text-[11px] font-medium text-slate-400">{formData.about.length}/500</span>
                      </div>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleInputChange}
                        required
                        maxLength={500}
                        rows={4}
                        placeholder="Eg. Briefly tell us why you'd be a great fit for this role..."
                        className="w-full p-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e63946] transition-all shadow-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Section 3: Resume Upload */}
                  <div className="mb-10">
                    <h3 className="text-[18px] font-black text-[#0f172a] mb-2">Resume Upload</h3>
                    <div className="h-1 w-8 bg-[#e63946] rounded-full mb-8"></div>

                    <div
                      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${dragActive ? 'border-[#e63946] bg-red-50' : 'border-slate-200 bg-[#f8faff] hover:border-[#e63946] hover:bg-red-50/50'
                        }`}
                      onDragEnter={() => setDragActive(true)}
                      onDragLeave={() => setDragActive(false)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('resume-upload')?.click()}
                    >
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload"
                      />

                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-4 bg-white border border-slate-100 ${resume ? 'text-green-500' : 'text-[#e63946]'
                        }`}>
                        {resume ? <FiCheckCircle size={24} /> : <FiUploadCloud size={24} />}
                      </div>

                      <h4 className="text-[15px] font-bold text-[#0f172a] mb-1">
                        {resume ? resume.name : 'Click to upload or drag and drop'}
                      </h4>
                      <p className="text-[13px] text-slate-500 font-medium">
                        {resume ? `${(resume.size / 1024 / 1024).toFixed(2)} MB • Ready` : 'PDF, DOC, DOCX up to 5MB'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-[12px] font-medium text-slate-500">
                      <FiInfo className="text-slate-400" /> Please ensure your resume is up to date and relevant to the role.
                    </div>
                  </div>

                  {/* Submit Area */}
                  <div>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full min-h-[56px] py-3 px-4 rounded-xl bg-[#e63946] text-white text-[13px] sm:text-[14px] font-bold uppercase tracking-wider sm:tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed leading-tight"
                    >
                      {otpLoading ? (
                        <FiLoader className="animate-spin" size={18} />
                      ) : (
                        <>
                          <FiSend size={16} className="shrink-0" /> 
                          <span className="text-center">VERIFY & SUBMIT APPLICATION</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-6 text-[12px] font-bold text-slate-400">
                      <FiLock /> Your information is secure and protected.
                    </div>
                  </div>

                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col items-center justify-center h-full min-h-[500px] text-center"
                >
                  <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-[#e63946]">
                    <FiMail size={40} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Check your inbox</h2>
                  <p className="mt-4 text-[15px] text-slate-500 font-medium max-w-sm">
                    We've sent a 6-digit verification code to <br />
                    <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg mt-2 inline-block border border-slate-200">{formData.email}</span>
                  </p>

                  <div className="w-full max-w-[320px] mt-10 mb-8">
                    <input
                      name="otp"
                      type="text"
                      placeholder="••••••"
                      required
                      maxLength={6}
                      autoFocus
                      className="w-full text-center text-4xl tracking-[0.5em] pl-[0.5em] font-black h-20 rounded-2xl bg-[#f8faff] border-2 border-slate-200 text-slate-800 shadow-sm outline-none transition-all focus:border-[#e63946] focus:ring-4 focus:ring-red-100 placeholder:text-2xl placeholder:font-light"
                      value={formData.otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, otp: val }));
                      }}
                    />
                  </div>

                  <div className="w-full max-w-[320px] space-y-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl bg-[#e63946] text-white text-[14px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <FiLoader className="animate-spin" size={18} />
                      ) : (
                        <>
                          <FiCheckCircle size={18} /> CONFIRM OTP
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[13px] font-bold text-slate-400 hover:text-slate-800 transition py-2 w-full flex items-center justify-center gap-2"
                    >
                      <FiArrowLeft size={14} /> Use a different email
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
