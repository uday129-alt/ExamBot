import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import { 
  Upload, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function SyllabusUpload() {
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [syllabi, setSyllabi] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchSyllabi = async () => {
    try {
      const res = await api.get('/syllabus');
      setSyllabi(res.data.syllabi);
    } catch (err) {
      console.error('Failed to load syllabi:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!subject) {
      setErrorMsg('Please specify the subject name.');
      return;
    }
    if (!file) {
      setErrorMsg('Please select a syllabus document file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('file', file);

    try {
      await api.post('/syllabus/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMsg('Syllabus file uploaded and text chunk vectors indexing started successfully!');
      setSubject('');
      setFile(null);
      // Clear file input
      const fileInput = document.getElementById('syllabus-file-input');
      if (fileInput) fileInput.value = '';
      
      // Refresh list
      fetchSyllabi();
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMsg(err.response?.data?.message || 'Upload failed. Ensure backend has pdf-parse dependencies.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this syllabus? All associated questions and vector indexes will be removed.')) {
      return;
    }
    try {
      await api.delete(`/syllabus/${id}`);
      setSyllabi(prev => prev.filter(item => item._id !== id));
      setSuccessMsg('Syllabus and Pinecone vectors deleted successfully.');
    } catch (err) {
      console.error('Deletion failed:', err);
      setErrorMsg('Failed to delete syllabus record.');
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Syllabus Indexer</h2>
        <p className="text-textMuted text-sm mt-1">Upload curriculum documents to parse, split, and embed into Pinecone vectors</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false}>
            <h3 className="text-lg font-bold text-white mb-6">Index New Course</h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-start gap-2.5 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              {successMsg && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl flex items-start gap-2.5 text-sm">
                  <CheckCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Course Subject Name</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Relational Databases"
                  className="w-full bg-white/5 border border-borderGray rounded-xl py-3 px-4 text-sm text-textLight placeholder-textMuted focus:outline-none focus:border-accentPurple transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-textLight uppercase tracking-wider block">Document File (.pdf, .docx, .txt)</label>
                <div className="border border-dashed border-borderGray hover:border-accentPurple/50 rounded-xl p-6 transition-all flex flex-col items-center justify-center cursor-pointer relative bg-white/[0.01]">
                  <input
                    type="file"
                    id="syllabus-file-input"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={32} className="text-textMuted mb-2" />
                  <span className="text-sm font-semibold text-textLight">
                    {file ? file.name : 'Select Syllabus Document'}
                  </span>
                  <span className="text-xs text-textMuted mt-1">Maximum file size: 10MB</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 bg-gradient-to-r from-accentPurple to-accentPink hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Upload size={18} />
                    Process & Index
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Uploaded Syllabi List */}
        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false}>
            <h3 className="text-lg font-bold text-white mb-6">Active Curriculum Sources</h3>

            {loadingList ? (
              <Loader message="Loading curriculum sources..." />
            ) : syllabi.length === 0 ? (
              <div className="text-center py-12 text-textMuted border border-dashed border-borderGray rounded-xl">
                <FileText size={40} className="mx-auto text-white/10 mb-3" />
                <p className="text-sm font-medium">No course syllabus has been indexed yet.</p>
                <p className="text-xs mt-1">Upload a curriculum file to start generating questions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-borderGray text-xs font-bold text-textMuted uppercase tracking-wider">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderGray text-sm">
                    {syllabi.map((syllabus) => (
                      <tr key={syllabus._id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-4 px-4 font-bold text-white">{syllabus.subject}</td>
                        <td className="py-4 px-4 text-textMuted max-w-[200px] truncate">{syllabus.originalFileName}</td>
                        <td className="py-4 px-4">
                          {syllabus.status === 'processed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              <CheckCircle size={12} />
                              Indexed
                            </span>
                          )}
                          {syllabus.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                              <Clock size={12} />
                              Parsing...
                            </span>
                          )}
                          {syllabus.status === 'failed' && (
                            <span 
                              title={syllabus.errorMessage}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 cursor-help"
                            >
                              <AlertTriangle size={12} />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDelete(syllabus._id)}
                            className="p-2 text-textMuted hover:text-red-400 border border-transparent hover:border-red-500/20 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
