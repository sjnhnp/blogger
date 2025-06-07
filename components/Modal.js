// ========================================================================
//                         components/Modal.js
// ========================================================================
export default function Modal({ show, title, message, onConfirm, onCancel, isConfirmDialog }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className={`flex ${isConfirmDialog ? 'justify-between' : 'justify-end'}`}>
                    {isConfirmDialog && <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">取消</button>}
                    <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isConfirmDialog ? '確定' : '好的'}</button>
                </div>
            </div>
        </div>
    );
};