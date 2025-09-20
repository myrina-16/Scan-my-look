
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Icon } from './Icon';
import { WardrobeItem } from '../types';

const EditWardrobeItemModal: React.FC = () => {
    const { editingItem, closeEditItemModal, updateWardrobeItem } = useAppContext();
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [colors, setColors] = useState('');
    const [season, setSeason] = useState<WardrobeItem['season']>('All');
    const [style, setStyle] = useState('');

    useEffect(() => {
        if (editingItem) {
            setCategory(editingItem.category);
            setDescription(editingItem.description);
            setColors(editingItem.colors.join(', '));
            setSeason(editingItem.season);
            setStyle(editingItem.style);
        }
    }, [editingItem]);

    if (!editingItem) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category.trim() && description.trim()) {
            updateWardrobeItem(editingItem.id, {
                category,
                description,
                colors: colors.split(',').map(c => c.trim()).filter(Boolean),
                season,
                style
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]" onClick={closeEditItemModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-brand-primary">Edit Item</h2>
                    <button onClick={closeEditItemModal} className="text-slate-400 hover:text-slate-800">
                        <Icon icon="close" className="w-6 h-6"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <img src={editingItem.image} alt="item to edit" className="w-full sm:w-32 h-auto sm:h-32 object-cover rounded-lg flex-shrink-0"/>
                        <div className="space-y-4 flex-1">
                            <div>
                                <label htmlFor="item-category" className="block text-sm font-medium text-slate-700">Category</label>
                                <input
                                    type="text"
                                    id="item-category"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="item-description" className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    id="item-description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary resize-none"
                                    required
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div>
                             <label htmlFor="item-colors" className="block text-sm font-medium text-slate-700">Colors</label>
                             <input type="text" id="item-colors" value={colors} onChange={e => setColors(e.target.value)} placeholder="e.g., blue, white" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md"/>
                        </div>
                        <div>
                             <label htmlFor="item-season" className="block text-sm font-medium text-slate-700">Season</label>
                             <select id="item-season" value={season} onChange={e => setSeason(e.target.value as WardrobeItem['season'])} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                                 <option>All</option>
                                 <option>Spring</option>
                                 <option>Summer</option>
                                 <option>Autumn</option>
                                 <option>Winter</option>
                             </select>
                        </div>
                        <div>
                             <label htmlFor="item-style" className="block text-sm font-medium text-slate-700">Style</label>
                             <input type="text" id="item-style" value={style} onChange={e => setStyle(e.target.value)} placeholder="e.g., Casual" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={closeEditItemModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-accent text-white rounded-md shadow-md hover:bg-opacity-90">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditWardrobeItemModal;