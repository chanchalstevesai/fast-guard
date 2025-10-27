import { ClipboardIcon } from '@heroicons/react/24/outline'; 
import { useState } from 'react';

const scopes = `ZohoCRM.send_mail.all.CREATE,ZohoCRM.modules.ALL,ZohoCRM.Files.READ,ZohoCRM.files.CREATE,ZohoCRM.modules.leads.READ,ZohoCRM.modules.emails.READ,ZohoCRM.modules.leads.CREATE,ZohoCRM.notifications.All,ZohoCRM.settings.all,ZohoCRM.users.all,ZohoCRM.settings.ALL,ZohoCRM.users.ALL,ZohoCRM.org.ALL,ZohoCRM.bulk.ALL,ZohoCRM.modules.emails.ALL,ZohoCRM.settings.signals.ALL,ZohoCRM.signals.ALL, ZohoMeeting.meeting.CREATE,ZohoBooks.customerpayments.CREATE,ZohoCRM.modules.ALL,ZohoBooks.contacts.READ, ZohoBooks.fullaccess.all,ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.users.ALL,ZohoCRM.org.ALL,ZohoCRM.bulk.ALL,ZohoBooks.contacts.CREATE,ZohoCRM.modules.ALL,ZohoBooks.estimates.READ,ZohoBooks.estimates.CREATE,ZohoCRM.modules.leads.CREATE,ZohoMail.messages.CREATE,ZohoCRM.send_mail.all.CREATE`;
const ScopesBox = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText(scopes);
    alert("Scopes copied to clipboard!");
  };

  return (
    <div className="relative bg-gray-100 p-4 rounded-md border border-gray-300">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900"
        title="Copy to clipboard"
      >
        <ClipboardIcon className="h-5 w-5" />
      </button>

      <pre className="text-sm font-semibold whitespace-pre-wrap break-all">{scopes}</pre>

    </div>
  );
};

export default ScopesBox;
