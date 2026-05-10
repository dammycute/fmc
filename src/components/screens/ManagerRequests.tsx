import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

const ManagerRequests: React.FC = () => {
  const { transferRequests, managers, userClubId, respondToTransferRequest } = useGameStore();
  
  const userClubRequests = transferRequests.filter(r => r.clubId === userClubId);
  const manager = managers.find(m => m.clubId === userClubId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-green-500">Approved</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      case 'DELAYED': return <Badge variant="outline">Delayed</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!manager) return <div>No manager found for your club.</div>;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{manager.name}</CardTitle>
              <CardDescription className="text-slate-400">Club Manager</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium mb-1">Relationship</div>
              <div className="flex items-center gap-2">
                <Progress value={manager.relationshipWithChairman} className="w-24 h-2 bg-slate-700" />
                <span className="text-sm font-bold">{manager.relationshipWithChairman}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="bg-white/5 p-3 rounded-lg backdrop-blur-sm">
              <div className="text-xs text-slate-400 mb-1">Philosophy</div>
              <div className="text-sm font-bold">{manager.philosophy.replace('_', ' ')}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg backdrop-blur-sm">
              <div className="text-xs text-slate-400 mb-1">Formation</div>
              <div className="text-sm font-bold">{manager.preferredFormation}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg backdrop-blur-sm">
              <div className="text-xs text-slate-400 mb-1">Preferred Age</div>
              <div className="text-sm font-bold">{manager.agePreference.min}-{manager.agePreference.max}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg backdrop-blur-sm">
              <div className="text-xs text-slate-400 mb-1">Ambition</div>
              <div className="text-sm font-bold">{Math.round(manager.ambition)}/100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1">Transfer Requests</h3>
        <ScrollArea className="h-[400px]">
          {userClubRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              No transfer requests yet. Your manager will contact you when they identify needs.
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {[...userClubRequests].reverse().map(request => (
                <Card key={request.id} className={`overflow-hidden transition-all duration-300 ${request.status === 'PENDING' ? 'ring-2 ring-primary/20 shadow-lg' : 'opacity-80'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(request.priority)}>{request.priority}</Badge>
                        <Badge variant="outline">{request.type.replace('_', ' ')}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">Week {request.weekRequested}, Season {request.seasonRequested}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm italic text-slate-700 bg-slate-50 p-3 rounded-md border-l-4 border-primary/40">
                      "{request.message}"
                    </p>
                    {request.suggestedPosition && (
                      <div className="mt-3 text-sm">
                        <span className="font-semibold">Suggested Position:</span> {request.suggestedPosition}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-slate-50/50 pt-4">
                    <div>
                      {getStatusBadge(request.status)}
                    </div>
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => respondToTransferRequest(request.id, 'REJECTED')}>Reject</Button>
                        <Button size="sm" variant="outline" onClick={() => respondToTransferRequest(request.id, 'DELAYED')}>Delay</Button>
                        <Button size="sm" onClick={() => respondToTransferRequest(request.id, 'APPROVED')}>Approve</Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Sporting Director Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-blue-700">
            {userClubRequests.some(r => r.status === 'PENDING') 
              ? "The manager is waiting for your decision on the current transfer requests. Approving them will improve his morale but cost the club money."
              : "The squad is currently stable. Keep an eye on the scouts' reports to find players that fit the manager's tactical philosophy."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerRequests;
