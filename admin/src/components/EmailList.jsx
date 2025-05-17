// Update the email list item component to fix spacing and remove random characters
const EmailListItem = ({ email, isSelected, onClick }) => {
  return (
    <div 
      className={`px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mr-3 mt-1">
          {email.from.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium text-gray-900 truncate">{cleanupEmailContent(email.from)}</h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {new Date(email.date).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-800 truncate mt-1">
            {cleanupEmailContent(email.subject)}
          </p>
          <p className="text-xs text-gray-500 truncate mt-1">
            {cleanupEmailContent(email.snippet || "")}
          </p>
        </div>
      </div>
    </div>
  );
};