import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { DailyTemplate, DayType, UserProfile } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Plus, Trash2, Calendar as CalendarIcon, 
    ClipboardList, ChevronRight, Settings2, 
    X, Clock, Salad, Dumbbell, Library, 
    Download, Layout, Coffee, Stethoscope, Plane
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay } from 'date-fns';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAY_TYPE_CONFIG: Record<DayType, { icon: any, color: string, label: string }> = {
    training: { icon: Dumbbell, color: 'text-blue-600 bg-blue-50', label: 'Active Day' },
    rest: { icon: Coffee, color: 'text-green-600 bg-green-50', label: 'Rest Day' },
    sick: { icon: Stethoscope, color: 'text-red-600 bg-red-50', label: 'Sick Day' },
    travel: { icon: Plane, color: 'text-orange-600 bg-orange-50', label: 'Travel Day' }
};

// Suggested categories — user can also type freeform
const TASK_CATEGORY_SUGGESTIONS = ['morning', 'focus', 'activity', 'education', 'recovery', 'evening', 'social'];
const NUTRITION_CATEGORY_SUGGESTIONS = ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'];

interface CategoryInputProps {
    value: string;
    onChange: (val: string) => void;
    suggestions: string[];
    listId: string;
}

const CategoryInput: React.FC<CategoryInputProps> = ({ value, onChange, suggestions, listId }) => (
    <div className="relative flex-shrink-0 w-[130px]">
        <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            list={listId}
            placeholder="category"
            className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold w-full"
        />
        <datalist id={listId}>
            {suggestions.map(s => <option key={s} value={s} />)}
        </datalist>
    </div>
);

const PlanBuilder: React.FC = () => {
    const { 
        activeProfile, saveTemplate, deleteTemplate, 
        assignTemplateToDates, saveToLibrary, deleteFromLibrary 
    } = usePlanner();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<DailyTemplate | null>(null);
    const [selectedTemplateForSchedule, setSelectedTemplateForSchedule] = useState<string | null>(null);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    // Library State
    const [libraryTab, setLibraryTab] = useState<'routines' | 'mealPlans' | 'drillSets'>('routines');
    const [editingSnippet, setEditingSnippet] = useState<any | null>(null);
    const [isSnippetEditing, setIsSnippetEditing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importType, setImportingType] = useState<'routines' | 'mealPlans' | 'drillSets' | null>(null);

    const handleCreateTemplate = () => {
        const newTemplate: DailyTemplate = {
            id: '',
            name: 'New Template',
            type: 'training',
            tasks: [],
            nutrition: [],
            drills: [],
            hydrationTarget: 8
        };
        setEditingTemplate(newTemplate);
        setIsEditing(true);
    };

    const handleEditTemplate = (template: DailyTemplate) => {
        setEditingTemplate({ 
            ...template,
            tasks: template.tasks || [],
            nutrition: template.nutrition || [],
            drills: template.drills || []
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editingTemplate) return;
        if (!editingTemplate.name.trim()) {
            alert('Please enter a template name');
            return;
        }
        try {
            await saveTemplate(editingTemplate);
            setIsEditing(false);
            setEditingTemplate(null);
        } catch (err) {
            console.error('Failed to save template:', err);
            alert(err instanceof Error ? err.message : 'Failed to save template');
        }
    };

    const handleSaveSnippet = async () => {
        if (!editingSnippet) return;
        if (!editingSnippet.name.trim()) {
            alert('Please enter a snippet name');
            return;
        }
        try {
            await saveToLibrary(libraryTab, editingSnippet);
            setIsSnippetEditing(false);
            setEditingSnippet(null);
        } catch (err) {
            console.error('Failed to save snippet:', err);
            alert(err instanceof Error ? err.message : 'Failed to save snippet');
        }
    };

    const handleImportSnippet = (snippet: any) => {
        if (!editingTemplate || !importType) return;
        
        const updated = { ...editingTemplate };
        if (importType === 'routines') {
            updated.tasks = [...(updated.tasks || []), ...(snippet.tasks || [])];
        } else if (importType === 'mealPlans') {
            updated.nutrition = [...(updated.nutrition || []), ...(snippet.nutrition || [])];
        } else if (importType === 'drillSets') {
            updated.drills = [...(updated.drills || []), ...(snippet.drills || [])];
        }
        
        setEditingTemplate(updated);
        setIsImporting(false);
        setImportingType(null);
    };

    const handleAssign = () => {
        if (selectedTemplateForSchedule) {
            const dateStrings = (selectedDates || []).map(d => {
                try {
                    return format(startOfDay(d), 'yyyy-MM-dd');
                } catch (e) {
                    return '';
                }
            }).filter(d => d !== '');
            
            const templateId = selectedTemplateForSchedule === 'DEFAULT_CLEAR' ? '' : selectedTemplateForSchedule;
            assignTemplateToDates(templateId, dateStrings);
            setSelectedDates([]);
            alert('Schedule updated successfully!');
        }
    };

    if (!activeProfile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                    <ClipboardList size={40} />
                </div>
                <div>
                    <h3 className="font-black text-slate-900">No Profile Selected</h3>
                    <p className="text-sm text-slate-400">Please create or select a profile to build plans.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            <header className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Build Mode</p>
                    <h1 className="text-xl font-black text-slate-900">Plan Builder</h1>
                </div>
                <div className="bg-blue-50 p-2 rounded-2xl">
                    <Settings2 size={24} className="text-blue-600" />
                </div>
            </header>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-[24px] h-12 bg-slate-100/50 p-1 mb-6">
                    <TabsTrigger value="templates" className="rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center gap-2">
                        <Layout size={14} /> Templates
                    </TabsTrigger>
                    <TabsTrigger value="library" className="rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center gap-2">
                        <Library size={14} /> Library
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6 outline-none">
                    {/* Templates Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Your Templates</h3>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100"
                                onClick={handleCreateTemplate}
                            >
                                <Plus size={14} className="mr-1" /> New Template
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {(activeProfile?.templates || []).map(template => (
                                <Card key={template.id} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl group">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${DAY_TYPE_CONFIG[template.type]?.color || 'bg-slate-100 text-slate-400'}`}>
                                            {DAY_TYPE_CONFIG[template.type] && React.createElement(DAY_TYPE_CONFIG[template.type].icon, { size: 24 })}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 tracking-tight">{template.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {(template.tasks || []).length} Tasks • {(template.drills || []).length} Goals • {DAY_TYPE_CONFIG[template.type]?.label || template.type}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEditTemplate(template)}
                                            >
                                                <ChevronRight size={18} />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm(`Delete template "${template.name}"?`)) {
                                                        deleteTemplate(template.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {(activeProfile?.templates || []).length === 0 && (
                                <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] space-y-2">
                                    <p className="text-sm font-bold text-slate-400">No templates created yet.</p>
                                    <Button variant="link" className="text-blue-600 font-black uppercase text-[10px] tracking-widest" onClick={handleCreateTemplate}>
                                        Create your first one
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Scheduler Section */}
                    {(activeProfile?.templates || []).length > 0 && (
                        <section className="space-y-4">
                            <div className="px-1">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Apply to Calendar</h3>
                            </div>
                            <Card className="border-none shadow-xl bg-white rounded-[32px] overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Template</label>
                                        <Select onValueChange={(val) => setSelectedTemplateForSchedule(val || 'DEFAULT_CLEAR')}>
                                            <SelectTrigger className="w-full h-12 rounded-2xl border-slate-100 font-bold bg-slate-50">
                                                <SelectValue placeholder="Choose a template..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DEFAULT_CLEAR">(Clear / Reset to Default)</SelectItem>
                                                {(activeProfile?.templates || []).map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Dates</label>
                                        <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                                            <Calendar
                                                mode="multiple"
                                                selected={selectedDates}
                                                onSelect={(dates) => setSelectedDates(dates || [])}
                                                className="rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <Button 
                                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-white"
                                        disabled={!(selectedDates || []).length}
                                        onClick={handleAssign}
                                    >
                                        <CalendarIcon size={18} className="mr-2" /> 
                                        {selectedTemplateForSchedule === "DEFAULT_CLEAR" ? "Clear Dates" : "Schedule Template"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </section>
                    )}
                </TabsContent>

                <TabsContent value="library" className="space-y-6 outline-none">
                    {/* Library Section */}
                    <section className="space-y-6">
                        <div className="flex bg-slate-100/50 p-1 rounded-2xl">
                            {(['routines', 'mealPlans', 'drillSets'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setLibraryTab(tab)}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${libraryTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    {tab === 'routines' ? 'Routines' : tab === 'mealPlans' ? 'Meals' : 'Goals'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                {libraryTab === 'routines' ? 'Routine Snippets' : libraryTab === 'mealPlans' ? 'Meal Plan Snippets' : 'Goal Set Snippets'}
                            </h3>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100"
                                onClick={() => {
                                    const newSnippet: any = { id: '', name: '' };
                                    if (libraryTab === 'routines') newSnippet.tasks = [];
                                    if (libraryTab === 'mealPlans') newSnippet.nutrition = [];
                                    if (libraryTab === 'drillSets') newSnippet.drills = [];
                                    setEditingSnippet(newSnippet);
                                    setIsSnippetEditing(true);
                                }}
                            >
                                <Plus size={14} className="mr-1" /> New Snippet
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {(activeProfile?.library?.[libraryTab] || []).map((snippet: any) => (
                                <Card key={snippet.id} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl group">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600`}>
                                            {libraryTab === 'routines' ? <Clock size={24} /> : libraryTab === 'mealPlans' ? <Salad size={24} /> : <Dumbbell size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 tracking-tight">{snippet.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {libraryTab === 'routines' ? `${(snippet.tasks || []).length} Tasks` : libraryTab === 'mealPlans' ? `${(snippet.nutrition || []).length} Meals` : `${(snippet.drills || []).length} Goals`}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => {
                                                    setEditingSnippet({ ...snippet });
                                                    setIsSnippetEditing(true);
                                                }}
                                            >
                                                <ChevronRight size={18} />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm(`Delete snippet "${snippet.name}"?`)) {
                                                        deleteFromLibrary(libraryTab, snippet.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {(activeProfile?.library?.[libraryTab] || []).length === 0 && (
                                <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] space-y-2">
                                    <p className="text-sm font-bold text-slate-400">No snippets saved in this category.</p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Save reusable blocks to build plans faster.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </TabsContent>
            </Tabs>

            {/* Template Editor Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-md w-[95%] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-slate-900 p-6 text-white">
                        <DialogTitle className="text-xl font-black italic tracking-tight flex items-center gap-3">
                            <Settings2 size={24} className="text-blue-400" />
                            {editingTemplate?.id ? 'Edit Template' : 'New Template'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Name</label>
                                <Input 
                                    value={editingTemplate?.name || ''} 
                                    onChange={e => setEditingTemplate(t => t ? ({ ...t, name: e.target.value }) : null)}
                                    className="h-12 rounded-2xl border-slate-100 font-bold bg-slate-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['training', 'rest', 'sick', 'travel'] as DayType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setEditingTemplate(t => t ? ({ ...t, type }) : null)}
                                            className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${editingTemplate?.type === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                        >
                                            {DAY_TYPE_CONFIG[type] && React.createElement(DAY_TYPE_CONFIG[type].icon, { size: 16 })}
                                            {DAY_TYPE_CONFIG[type]?.label || type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Task Editor */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Routine Tasks</label>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-indigo-600 bg-indigo-50 rounded-lg" onClick={() => {
                                            setImportingType('routines');
                                            setIsImporting(true);
                                        }}>
                                            <Download size={10} className="mr-1" /> Import
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-blue-600 bg-blue-50 rounded-lg" onClick={() => {
                                            setEditingTemplate(t => t ? ({ ...t, tasks: [...(t.tasks || []), { label: '', category: 'morning' }] }) : null)
                                        }}>
                                            <Plus size={10} className="mr-1" /> Add
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-400 ml-1">Category accepts custom values — type anything or pick a suggestion.</p>
                                <div className="space-y-2">
                                    {editingTemplate?.tasks?.map((task, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <CategoryInput
                                                value={task.category}
                                                onChange={(val) => {
                                                    const newTasks = [...(editingTemplate?.tasks || [])];
                                                    if (newTasks[idx]) {
                                                        newTasks[idx] = { ...newTasks[idx], category: val };
                                                        setEditingTemplate(t => t ? ({ ...t, tasks: newTasks }) : null);
                                                    }
                                                }}
                                                suggestions={TASK_CATEGORY_SUGGESTIONS}
                                                listId={`task-cats-${idx}`}
                                            />
                                            <Input 
                                                value={task.label} 
                                                onChange={e => {
                                                    const newTasks = [...(editingTemplate?.tasks || [])];
                                                    if (newTasks[idx]) {
                                                        newTasks[idx] = { ...newTasks[idx], label: e.target.value };
                                                        setEditingTemplate(t => t ? ({ ...t, tasks: newTasks }) : null);
                                                    }
                                                }}
                                                placeholder="Task name..."
                                                className="h-10 rounded-xl border-slate-100 font-bold bg-slate-50"
                                            />
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500" onClick={() => {
                                                const newTasks = editingTemplate?.tasks?.filter((_, i) => i !== idx) || [];
                                                setEditingTemplate(t => t ? ({ ...t, tasks: newTasks }) : null);
                                            }}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Nutrition Editor */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nutrition Items</label>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-indigo-600 bg-indigo-50 rounded-lg" onClick={() => {
                                            setImportingType('mealPlans');
                                            setIsImporting(true);
                                        }}>
                                            <Download size={10} className="mr-1" /> Import
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-blue-600 bg-blue-50 rounded-lg" onClick={() => {
                                            setEditingTemplate(t => t ? ({ ...t, nutrition: [...(t.nutrition || []), { label: '', category: 'breakfast' }] }) : null)
                                        }}>
                                            <Plus size={10} className="mr-1" /> Add
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-400 ml-1">Use custom meal categories like "snack", "pre-workout", etc.</p>
                                <div className="space-y-2">
                                    {editingTemplate?.nutrition?.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <CategoryInput
                                                value={item.category}
                                                onChange={(val) => {
                                                    const newItems = [...(editingTemplate?.nutrition || [])];
                                                    if (newItems[idx]) {
                                                        newItems[idx] = { ...newItems[idx], category: val };
                                                        setEditingTemplate(t => t ? ({ ...t, nutrition: newItems }) : null);
                                                    }
                                                }}
                                                suggestions={NUTRITION_CATEGORY_SUGGESTIONS}
                                                listId={`nut-cats-${idx}`}
                                            />
                                            <Input 
                                                value={item.label} 
                                                onChange={e => {
                                                    const newItems = [...(editingTemplate?.nutrition || [])];
                                                    if (newItems[idx]) {
                                                        newItems[idx] = { ...newItems[idx], label: e.target.value };
                                                        setEditingTemplate(t => t ? ({ ...t, nutrition: newItems }) : null);
                                                    }
                                                }}
                                                placeholder="Food item..."
                                                className="h-10 rounded-xl border-slate-100 font-bold bg-slate-50"
                                            />
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500" onClick={() => {
                                                const newItems = editingTemplate?.nutrition?.filter((_, i) => i !== idx) || [];
                                                setEditingTemplate(t => t ? ({ ...t, nutrition: newItems }) : null);
                                            }}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Goals / Drills Editor */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goals & Action Items</label>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-indigo-600 bg-indigo-50 rounded-lg" onClick={() => {
                                            setImportingType('drillSets');
                                            setIsImporting(true);
                                        }}>
                                            <Download size={10} className="mr-1" /> Import
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-blue-600 bg-blue-50 rounded-lg" onClick={() => {
                                            setEditingTemplate(t => t ? ({ ...t, drills: [...(t.drills || []), ''] }) : null)
                                        }}>
                                            <Plus size={10} className="mr-1" /> Add
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-400 ml-1">These appear as checkable targets in the daily log.</p>
                                <div className="space-y-2">
                                    {editingTemplate?.drills?.map((drill, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input 
                                                value={drill} 
                                                onChange={e => {
                                                    const newDrills = [...(editingTemplate?.drills || [])];
                                                    newDrills[idx] = e.target.value;
                                                    setEditingTemplate(t => t ? ({ ...t, drills: newDrills }) : null);
                                                }}
                                                placeholder="e.g. Complete 30-min run, Read 20 pages..."
                                                className="h-10 rounded-xl border-slate-100 font-bold bg-slate-50 flex-1"
                                            />
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500" onClick={() => {
                                                const newDrills = (editingTemplate?.drills || []).filter((_, i) => i !== idx);
                                                setEditingTemplate(t => t ? ({ ...t, drills: newDrills }) : null);
                                            }}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 flex-row gap-3">
                        <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest border-slate-200" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest shadow-lg shadow-blue-100 text-white" onClick={handleSave}>
                            Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Snippet Editor Dialog */}
            <Dialog open={isSnippetEditing} onOpenChange={setIsSnippetEditing}>
                <DialogContent className="max-w-md w-[95%] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-blue-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black italic tracking-tight flex items-center gap-3">
                            <Library size={24} className="text-white" />
                            {editingSnippet?.id ? 'Edit Snippet' : 'New Snippet'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Snippet Name</label>
                                <Input 
                                    value={editingSnippet?.name || ''} 
                                    onChange={e => setEditingSnippet((s: any) => s ? ({ ...s, name: e.target.value }) : null)}
                                    className="h-12 rounded-2xl border-slate-100 font-bold bg-slate-50"
                                    placeholder="e.g., Morning Flow, Pre-Workout Meal"
                                />
                            </div>

                            {libraryTab === 'routines' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tasks</label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-blue-600 bg-blue-50 rounded-lg" onClick={() => {
                                            setEditingSnippet((s: any) => s ? ({ ...s, tasks: [...(s.tasks || []), { label: '', category: 'morning' }] }) : null)
                                        }}>
                                            <Plus size={10} className="mr-1" /> Add Task
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {editingSnippet?.tasks?.map((task: any, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <CategoryInput
                                                    value={task.category || 'morning'}
                                                    onChange={(val) => {
                                                        const newTasks = [...(editingSnippet.tasks || [])];
                                                        newTasks[idx] = { ...newTasks[idx], category: val };
                                                        setEditingSnippet((s: any) => s ? ({ ...s, tasks: newTasks }) : null);
                                                    }}
                                                    suggestions={TASK_CATEGORY_SUGGESTIONS}
                                                    listId={`snip-task-cats-${idx}`}
                                                />
                                                <Input 
                                                    value={task.label} 
                                                    onChange={e => {
                                                        const newTasks = [...(editingSnippet.tasks || [])];
                                                        newTasks[idx] = { ...newTasks[idx], label: e.target.value };
                                                        setEditingSnippet((s: any) => s ? ({ ...s, tasks: newTasks }) : null);
                                                    }}
                                                    placeholder="Task name..."
                                                    className="h-10 rounded-xl border-slate-100 font-bold bg-slate-50 flex-1"
                                                />
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500" onClick={() => {
                                                    const newTasks = editingSnippet.tasks.filter((_: any, i: number) => i !== idx);
                                                    setEditingSnippet((s: any) => s ? ({ ...s, tasks: newTasks }) : null);
                                                }}>
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {libraryTab === 'mealPlans' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meals</label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-blue-600 bg-blue-50 rounded-lg" onClick={() => {
                                            setEditingSnippet((s: any) => s ? ({ ...s, nutrition: [...(s.nutrition || []), { label: '', category: 'breakfast' }] }) : null)
                                        }}>
                                            <Plus size={10} className="mr-1" /> Add Meal
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {editingSnippet?.nutrition?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <CategoryInput
                                                    value={item.category || 'breakfast'}
                                                    onChange={(val) => {
                                                        const newItems = [...(editingSnippet.nutrition || [])];
                                                        newItems[idx] = { ...newItems[idx], category: val };
                                                        setEditingSnippet((s: any) => s ? ({ ...s, nutrition: newItems }) : null);
                                                    }}
                                                    suggestions={NUTRITION_CATEGORY_SUGGESTIONS}
                                                    listId={`snip-nut-cats-${idx}`}
                                                />
                                                <Input 
                                                    value={item.label} 
                                                    onChange={e => {
                                                        const newItems = [...(editingSnippet.nutrition || [])];
                                                        newItems[idx] = { ...newItems[idx], label: e.target.value };
                                                        setEditingSnippet((s: any) => s ? ({ ...s, nutrition: newItems }) : null);
                                                    }}
                                                    placeholder="Food item..."
                                                    className="h-10 rounded-xl border-slate-100 font-bold bg-slate-50 flex-1"
                                                />
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500" onClick={() => {
                                                    const newItems = editingSnippet.nutrition.filter((_: any, i: number) => i !== idx);
                                                    setEditingSnippet((s: any) => s ? ({ ...s, nutrition: newItems }) : null);
                                                }}>
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {libraryTab === 'drillSets' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goals</label>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-blue-600 bg-blue-50 rounded-lg" onClick={() => {
                                            setEditingSnippet((s: any) => s ? ({ ...s, drills: [...(s.drills || []), ''] }) : null)
                                        }}>
                                            <Plus size={10} className="mr-1" /> Add Goal
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {editingSnippet?.drills?.map((drill: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <Input 
                                                    value={drill} 
                                                    onChange={e => {
                                                        const newDrills = [...(editingSnippet.drills || [])];
                                                        newDrills[idx] = e.target.value;
                                                        setEditingSnippet((s: any) => s ? ({ ...s, drills: newDrills }) : null);
                                                    }}
                                                    placeholder="Goal description..."
                                                    className="h-10 rounded-xl border-slate-100 font-bold bg-slate-50 flex-1"
                                                />
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500" onClick={() => {
                                                    const newDrills = editingSnippet.drills.filter((_: string, i: number) => i !== idx);
                                                    setEditingSnippet((s: any) => s ? ({ ...s, drills: newDrills }) : null);
                                                }}>
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 flex-row gap-3">
                        <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest border-slate-200" onClick={() => setIsSnippetEditing(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest shadow-lg shadow-blue-100 text-white" onClick={handleSaveSnippet}>
                            Save Snippet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Snippet Dialog */}
            <Dialog open={isImporting} onOpenChange={setIsImporting}>
                <DialogContent className="max-w-md w-[95%] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-indigo-600 p-6 text-white">
                        <DialogTitle className="text-xl font-black italic tracking-tight flex items-center gap-3">
                            <Download size={24} className="text-white" />
                            Import from Library
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto bg-white">
                        {(activeProfile?.library?.[importType || 'routines'] || []).length === 0 ? (
                            <p className="text-center text-sm font-bold text-slate-400 py-8">No snippets saved in library.</p>
                        ) : (
                            (activeProfile?.library?.[importType || 'routines'] || []).map((snippet: any) => (
                                <button
                                    key={snippet.id}
                                    className="w-full text-left p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                                    onClick={() => handleImportSnippet(snippet)}
                                >
                                    <p className="font-black text-slate-900">{snippet.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        {importType === 'routines' ? `${(snippet.tasks || []).length} tasks` :
                                         importType === 'mealPlans' ? `${(snippet.nutrition || []).length} items` :
                                         `${(snippet.drills || []).length} goals`}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                    <DialogFooter className="p-4 bg-slate-50">
                        <Button variant="outline" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest border-slate-200" onClick={() => setIsImporting(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlanBuilder;
