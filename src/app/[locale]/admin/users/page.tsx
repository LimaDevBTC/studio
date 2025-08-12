
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, File, AlertCircle, Loader2, Check, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: string;
  joined: string;
  isAdmin?: boolean;
  planExpiryDate?: string | null;
  planExpiryDateObj?: Date | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const t = useTranslations('AdminUsersPage');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      
      if (userSnapshot.empty) {
        setUsers([]);
      } else {
        const usersList = userSnapshot.docs.map(doc => {
          const data = doc.data();
          const joinedDate = data.joined?.toDate ? data.joined.toDate() : new Date();
          const expiryDateObj = data.planExpiryDate?.toDate ? data.planExpiryDate.toDate() : null;
          return {
            id: doc.id,
            name: data.name || "N/A",
            email: data.email || "N/A",
            plan: data.plan || "Free Trial",
            joined: joinedDate.toLocaleDateString(),
            isAdmin: data.isAdmin || false,
            planExpiryDate: expiryDateObj ? expiryDateObj.toLocaleDateString() : null,
            planExpiryDateObj: expiryDateObj,
          };
        });

        usersList.sort((a, b) => {
          const dateA = a.planExpiryDateObj;
          const dateB = b.planExpiryDateObj;
          if (dateA && dateB) {
            return dateA.getTime() - dateB.getTime();
          }
          if (dateA) return -1; // dateA exists, dateB doesn't, so A comes first
          if (dateB) return 1;  // dateB exists, dateA doesn't, so B comes first
          return 0; // neither exists
        });

        setUsers(usersList);
      }
    } catch (err: any) {
      console.error("Error fetching users: ", err);
      setError(t('errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
        if (userData?.isAdmin) {
          fetchUsers();
        } else {
          setError(t('errorPermission'));
          setLoading(false);
        }
    } else if (!authLoading && !user) {
        setError(t('errorLogin'));
        setLoading(false);
    }
  }, [authLoading, user, userData, t]);

  const openManageModal = (user: UserData) => {
    setSelectedUser(user);
    setIsManageModalOpen(true);
  };
  
  const handleAccessUpdate = async (action: 'grant30' | 'grant365' | 'revoke') => {
    if (!selectedUser) return;
    setSavingPlan(true);

    const userRef = doc(db, "users", selectedUser.id);
    let newPlanData = {};
    let toastDescription = "";

    try {
      if (action === 'revoke') {
        newPlanData = { plan: "Free Trial", planExpiryDate: null };
        toastDescription = t('toast.updateSuccessDescription.revoked', { name: selectedUser.name });
      } else {
        const expiryDate = new Date();
        const daysToAdd = action === 'grant30' ? 30 : 365;
        const newPlanName = action === 'grant30' ? "Mensal" : "Anual";
        expiryDate.setDate(expiryDate.getDate() + daysToAdd);
        newPlanData = { plan: newPlanName, planExpiryDate: expiryDate };
        toastDescription = `O plano de ${selectedUser.name} foi alterado para '${newPlanName}'.`;
      }

      await updateDoc(userRef, newPlanData);
      toast({ title: t('toast.updateSuccessTitle'), description: toastDescription });
      fetchUsers(); // Refresh data
      setIsManageModalOpen(false);

    } catch (error: any) {
        toast({ variant: "destructive", title: t('toast.updateErrorTitle'), description: error.message });
        console.error("Error updating plan:", error);
    } finally {
        setSavingPlan(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
              <File className="mr-2 h-4 w-4" /> {t('exportButton')}
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead>{t('table.plan')}</TableHead>
                <TableHead>{t('table.expires')}</TableHead>
                <TableHead>{t('table.joined')}</TableHead>
                <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || authLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t('errorTitle')}</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : Array.isArray(users) && users.length > 0 ? (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           {u.name}
                           {u.isAdmin && <Badge variant="destructive">{t('adminBadge')}</Badge>}
                        </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.plan !== "Free Trial" ? 'default' : 'outline'}>
                          {u.plan || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.planExpiryDate || '—'}
                    </TableCell>
                    <TableCell>{u.joined}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t('table.menu')}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => openManageModal(u)}>
                              {t('manageAccess')}
                            </DropdownMenuItem>
                          <DropdownMenuItem disabled>{t('viewDetails')}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" disabled>{t('suspendUser')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">
                        {t('noUsersFound')}
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('dialog.title', { name: selectedUser?.name })}</DialogTitle>
                <DialogDescription>
                    {t('dialog.description')}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
               <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t('dialog.currentPlan')}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedUser?.plan !== "Free Trial" ? 'default' : 'outline'}>
                      {selectedUser?.plan}
                    </Badge>
                    {selectedUser?.planExpiryDate && (
                      <span className="text-sm text-muted-foreground">({t('table.expires')}: {selectedUser.planExpiryDate})</span>
                    )}
                  </div>
               </div>
               
               <div className="space-y-2">
                 <Label className="text-sm font-medium">{t('dialog.actions.title')}</Label>
                 <div className="grid gap-2 sm:grid-cols-2">
                    <Button onClick={() => handleAccessUpdate('grant30')} disabled={savingPlan}>
                       {savingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       <Check className="mr-2 h-4 w-4" />
                       {t('dialog.actions.grant30Days')}
                    </Button>
                    <Button onClick={() => handleAccessUpdate('grant365')} disabled={savingPlan}>
                       {savingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       <Check className="mr-2 h-4 w-4" />
                       {t('dialog.actions.grant1Year')}
                    </Button>
                 </div>
                 <Button variant="destructive" className="w-full" onClick={() => handleAccessUpdate('revoke')} disabled={savingPlan}>
                    {savingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('dialog.actions.revoke')}
                 </Button>
               </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">{t('dialog.cancel')}</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
