/**
 * Issuer Dashboard Header
 * Header for Department Issuer Console
 */

'use client'

interface IssuerHeaderProps {
  issuerAccountId: string
  network?: string
}

export function IssuerHeader({ issuerAccountId, network = 'testnet' }: IssuerHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Department Issuer Console
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Design and issue on-chain credentials to your students
          </p>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Live
          </span>
        </div>
      </div>
      
      {/* Network info */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Network:</span>
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded font-mono text-xs">
            {network}
          </span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-400" />
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Issuer Account:</span>
          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {issuerAccountId}
          </span>
        </div>
      </div>
    </div>
  )
}
