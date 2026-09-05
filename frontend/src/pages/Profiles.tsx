import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, User, Trash2, CheckCircle2, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Profiles: React.FC = () => {
  const { profiles, activeProfile, addProfile, switchProfile, deleteProfile } = usePlanner();
  const { user, logout } = useAuth();
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addProfile(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  const handleSwitch = (id: string) => {
    switchProfile(id);
    navigate('/');
  };

  return (
    <motion.div 
        className="space-y-6 pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
      <header className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Account Management</p>
            <h1 className="text-xl font-black text-slate-900">Profiles</h1>
        </div>
        <div className="bg-blue-50 p-2 rounded-2xl">
            <UserCircle2 size={24} className="text-blue-600" />
        </div>
      </header>

      {user && (
        <Card className="border-none shadow-md overflow-hidden rounded-3xl bg-slate-950 text-white">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-black text-white italic">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <h3 className="font-black tracking-tight text-white text-sm leading-tight">{user.displayName}</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider lowercase mt-0.5">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl flex items-center gap-2 px-3 h-10 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card 
                className={`border-none shadow-md overflow-hidden rounded-3xl transition-all cursor-pointer ${activeProfile?.id === profile.id ? 'ring-2 ring-blue-600 ring-offset-2' : 'hover:bg-slate-50'}`}
                onClick={() => handleSwitch(profile.id)}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${activeProfile?.id === profile.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 tracking-tight">{profile.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Since {new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                  {activeProfile?.id === profile.id && (
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-blue-600" />
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete profile for ${profile.name}? All data will be lost.`)) {
                            deleteProfile(profile.id);
                        }
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {isAdding ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Profile Name</label>
                            <Input 
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter your name..."
                                className="bg-white border-none h-12 rounded-2xl font-bold focus-visible:ring-blue-600 shadow-inner"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-2xl h-12 font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                                Create Profile
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-2xl h-12 font-black uppercase tracking-widest text-slate-400">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Button 
            variant="outline" 
            className="h-20 border-2 border-dashed border-slate-200 bg-white rounded-3xl flex flex-col gap-1 hover:bg-slate-50 hover:border-blue-300 transition-all group"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500">Add New Profile</span>
          </Button>
        )}
      </div>

      {profiles.length === 0 && (
          <div className="text-center py-10 space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center text-slate-300">
                  <User size={40} />
              </div>
              <div>
                  <h3 className="font-black text-slate-900">No Profiles Yet</h3>
                  <p className="text-sm font-medium text-slate-400 max-w-[200px] mx-auto">Create a profile to start building better habits.</p>
              </div>
          </div>
      )}
    </motion.div>
  );
};

export default Profiles;
