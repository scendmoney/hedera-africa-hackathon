/**
 * Issuer Studio Event Log
 * Displays a real-time log of HCS message submissions
 */

import { SubmittedEvent } from '@/lib/issuer/types'

interface EventLogProps {
  events: SubmittedEvent[]
}

export function EventLog({ events }: EventLogProps) {
  if (events.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Submission Log</h2>
        <div className="text-gray-500 text-sm italic">
          No submissions yet. Create and submit a message to see it here.
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Submission Log</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 px-2">Time</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-left py-2 px-2">Topic</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Seq #</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr 
                key={event.id} 
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-2 px-2 text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </td>
                
                <td className="py-2 px-2 font-mono text-xs">
                  {event.type}
                </td>
                
                <td className="py-2 px-2 text-xs">
                  {event.topic}
                </td>
                
                <td className="py-2 px-2">
                  <StatusBadge status={event.status} error={event.error} />
                </td>
                
                <td className="py-2 px-2 font-mono text-xs">
                  {event.sequenceNumber || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Optional: Show most recent event details */}
      {events.length > 0 && events[0].status === 'confirmed' && (
        <div className="text-xs text-gray-600 space-y-1 p-3 bg-green-50 rounded border border-green-200">
          <div className="font-semibold text-green-800">Latest Submission Success</div>
          {events[0].transactionId && (
            <div>Transaction: <span className="font-mono">{events[0].transactionId}</span></div>
          )}
          {events[0].consensusTimestamp && (
            <div>Consensus: {events[0].consensusTimestamp}</div>
          )}
        </div>
      )}
      
      {events.length > 0 && events[0].status === 'failed' && events[0].error && (
        <div className="text-xs text-gray-600 space-y-1 p-3 bg-red-50 rounded border border-red-200">
          <div className="font-semibold text-red-800">Latest Submission Failed</div>
          <div className="text-red-700">{events[0].error}</div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, error }: { status: SubmittedEvent['status'], error?: string }) {
  const statusConfig = {
    pending: {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: 'Pending'
    },
    confirmed: {
      className: 'bg-green-100 text-green-800 border-green-300',
      label: 'Confirmed'
    },
    failed: {
      className: 'bg-red-100 text-red-800 border-red-300',
      label: 'Failed'
    }
  }
  
  const config = statusConfig[status]
  
  return (
    <span 
      className={`inline-block px-2 py-1 rounded text-xs font-medium border ${config.className}`}
      title={error}
    >
      {config.label}
    </span>
  )
}
