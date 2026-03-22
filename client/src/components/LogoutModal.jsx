import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

/**
 * LogoutModal – animated OK / Cancel confirmation dialog.
 *
 * Props:
 *   isOpen   – boolean controlling visibility
 *   onConfirm – called when user clicks "Yes, Logout"
 *   onCancel  – called when user clicks "Cancel" or the backdrop
 */
const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                /* Backdrop */
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={onCancel}
                >
                    {/* Modal card – stop propagation so clicking inside doesn't close */}
                    <motion.div
                        key="modal"
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden
                                   bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                    >
                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-3 right-3 p-1.5 rounded-full text-zinc-400
                                       hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700
                                       dark:hover:text-zinc-200 transition"
                        >
                            <X size={16} />
                        </button>

                        {/* Icon header */}
                        <div className="flex flex-col items-center pt-8 pb-4 px-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-400
                                            flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-red-900/40 mb-4">
                                <LogOut size={28} className="text-white" />
                            </div>
                            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                                Logout of EzyEduTube?
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-1 mb-2">
                                Your session will be ended. You can always log back in.
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800 mx-4" />

                        {/* Actions */}
                        <div className="flex gap-3 p-5">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                                           border-2 border-zinc-200 dark:border-zinc-700
                                           text-zinc-600 dark:text-zinc-300
                                           hover:border-zinc-400 dark:hover:border-zinc-500
                                           hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold
                                           bg-gradient-to-r from-red-500 to-orange-400
                                           text-white shadow-md shadow-red-200 dark:shadow-red-900/30
                                           hover:opacity-90 active:scale-95 transition"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LogoutModal;
