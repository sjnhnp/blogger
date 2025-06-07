// ========================================================================
//                         components/Modal.js
// ========================================================================
export default function Modal({ show, title, message, onConfirm, onCancel, isConfirmDialog }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
                <h3 className="text-lg font-serif font-bold text-primary mb-4">{title}</h3>
                <p className="text-primary/80 mb-6">{message}</p>
                <div className={`flex ${isConfirmDialog ? 'justify-between' : 'justify-end'}`}>
                    {isConfirmDialog && <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-primary rounded-md hover:bg-gray-200 transition-colors">取消</button>}
                    <button onClick={onConfirm} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">{isConfirmDialog ? '確定' : '好的'}</button>
                </div>
            </div>
        </div>
    );
};