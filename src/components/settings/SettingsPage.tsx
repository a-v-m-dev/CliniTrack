import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb-browser';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { User, Key, Bell, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Initialize PouchDB
const db = new PouchDB('CliniTrack');

// Define User interface
interface UserDoc {
  _id: string;
  type: 'user';
  name: string;
  email: string;
  password: string;
  role: 'secretary' | 'doctor';
  createdAt: string;
  updatedAt?: string;
  notifications?: {
    followUpReminders: boolean;
    highRiskAlerts: boolean;
    newPatientRegistrations: boolean;
    labResultsAvailable: boolean;
    systemMaintenance: boolean;
  };
}

export function SettingsPage() {
  const { user: authUser, updateProfile, changePassword } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserDoc | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    followUpReminders: true,
    highRiskAlerts: true,
    newPatientRegistrations: false,
    labResultsAvailable: false,
    systemMaintenance: true
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [messages, setMessages] = useState({
    profile: '',
    password: '',
    notifications: ''
  });
  const [errors, setErrors] = useState({
    profile: '',
    password: '',
    notifications: ''
  });

  // Fetch current user data from PouchDB
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser?.email) return;

      try {
        const userDocId = `user_${authUser.email}`;
        // Remove the type argument and use type assertion instead
        const userDoc = await db.get(userDocId) as UserDoc;
        setCurrentUser(userDoc);
        setProfileData({
          name: userDoc.name,
          email: userDoc.email
        });
        setNotificationSettings(userDoc.notifications || {
          followUpReminders: true,
          highRiskAlerts: true,
          newPatientRegistrations: userDoc.role === 'doctor',
          labResultsAvailable: userDoc.role === 'doctor',
          systemMaintenance: true
        });
      } catch (err: any) {
        if (err.name === 'not_found') {
          console.warn('Current user not found in PouchDB');
        } else {
          console.error('Failed to fetch current user:', err);
        }
      }
    };

    fetchCurrentUser();
  }, [authUser?.email]);

  const clearMessages = () => {
    setMessages({ profile: '', password: '', notifications: '' });
    setErrors({ profile: '', password: '', notifications: '' });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsUpdatingProfile(true);

    if (!profileData.name || !profileData.email) {
      setErrors(prev => ({ ...prev, profile: 'Please fill in all fields' }));
      setIsUpdatingProfile(false);
      return;
    }

    try {
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Update in PouchDB
      const updatedUser: UserDoc = {
        ...currentUser,
        name: profileData.name,
        email: profileData.email,
        updatedAt: new Date().toISOString()
      };

      await db.put(updatedUser);
      setCurrentUser(updatedUser);

      // Update in AuthContext
      updateProfile(profileData);

      setMessages(prev => ({ ...prev, profile: 'Profile updated successfully' }));
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrors(prev => ({ ...prev, profile: 'Failed to update profile' }));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsChangingPassword(true);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'Please fill in all password fields' }));
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'New passwords do not match' }));
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors(prev => ({ ...prev, password: 'New password must be at least 6 characters long' }));
      setIsChangingPassword(false);
      return;
    }

    try {
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Verify current password
      if (passwordData.currentPassword !== currentUser.password) {
        setErrors(prev => ({ ...prev, password: 'Current password is incorrect' }));
        setIsChangingPassword(false);
        return;
      }

      // Update password in PouchDB
      const updatedUser: UserDoc = {
        ...currentUser,
        password: passwordData.newPassword,
        updatedAt: new Date().toISOString()
      };

      await db.put(updatedUser);
      setCurrentUser(updatedUser);

      // Update in AuthContext
      const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (success) {
        setMessages(prev => ({ ...prev, password: 'Password changed successfully' }));
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setErrors(prev => ({ ...prev, password: 'Failed to change password' }));
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      setErrors(prev => ({ ...prev, password: 'Failed to change password' }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationSave = async () => {
    clearMessages();
    setIsSavingNotifications(true);

    try {
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Update notifications in PouchDB
      const updatedUser: UserDoc = {
        ...currentUser,
        notifications: notificationSettings,
        updatedAt: new Date().toISOString()
      };

      await db.put(updatedUser);
      setCurrentUser(updatedUser);

      setMessages(prev => ({ ...prev, notifications: 'Notification preferences saved successfully' }));
    } catch (err) {
      console.error('Failed to save notifications:', err);
      setErrors(prev => ({ ...prev, notifications: 'Failed to save notification preferences' }));
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={isUpdatingProfile}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isUpdatingProfile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="capitalize font-medium">{currentUser.role}</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your role determines your access permissions within CliniTrack
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="font-medium">
                      {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {messages.profile && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{messages.profile}</AlertDescription>
                  </Alert>
                )}

                {errors.profile && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.profile}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      disabled={isChangingPassword}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      disabled={isChangingPassword}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={isChangingPassword}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {messages.password && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{messages.password}</AlertDescription>
                  </Alert>
                )}

                {errors.password && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Follow-up Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when patient follow-ups are due
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.followUpReminders}
                    onCheckedChange={() => handleNotificationToggle('followUpReminders')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">High Risk Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Immediate notifications for high-risk patients
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.highRiskAlerts}
                    onCheckedChange={() => handleNotificationToggle('highRiskAlerts')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">New Patient Registrations</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications when new patients are registered
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.newPatientRegistrations}
                    onCheckedChange={() => handleNotificationToggle('newPatientRegistrations')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Lab Results Available</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new lab results are uploaded
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.labResultsAvailable}
                    onCheckedChange={() => handleNotificationToggle('labResultsAvailable')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">System Maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      Updates about system maintenance and downtime
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.systemMaintenance}
                    onCheckedChange={() => handleNotificationToggle('systemMaintenance')}
                  />
                </div>
              </div>

              {messages.notifications && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{messages.notifications}</AlertDescription>
                </Alert>
              )}

              {errors.notifications && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.notifications}</AlertDescription>
                </Alert>
              )}

              <div className="pt-4">
                <Button 
                  onClick={handleNotificationSave}
                  disabled={isSavingNotifications}
                >
                  {isSavingNotifications ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Notification Preferences'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}