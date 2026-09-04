import { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services';

const Profile = () => {
  const { currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: {
      street: currentUser?.address?.street || '',
      city: currentUser?.address?.city || '',
      state: currentUser?.address?.state || '',
      zipCode: currentUser?.address?.zipCode || '',
      country: currentUser?.address?.country || '',
    },
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setProfile((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await updateProfile(profile);
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password changed successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">Manage your personal details and password.</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      {message && <div className="success-banner">{message}</div>}

      <div className="two-column">
        <form className="panel form-stack" onSubmit={handleProfileSubmit}>
          <h2>Account details</h2>
          <Input label="Email" value={currentUser?.email || ''} disabled />
          <Input label="Full name" name="name" required value={profile.name} onChange={handleProfileChange} />
          <Input label="Phone" name="phone" value={profile.phone} onChange={handleProfileChange} />
          <Input label="Street" name="address.street" value={profile.address.street} onChange={handleProfileChange} />
          <div className="form-row">
            <Input label="City" name="address.city" value={profile.address.city} onChange={handleProfileChange} />
            <Input label="State" name="address.state" value={profile.address.state} onChange={handleProfileChange} />
          </div>
          <div className="form-row">
            <Input label="Zip code" name="address.zipCode" value={profile.address.zipCode} onChange={handleProfileChange} />
            <Input label="Country" name="address.country" value={profile.address.country} onChange={handleProfileChange} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </form>

        <form className="panel form-stack" onSubmit={handlePasswordSubmit}>
          <h2>Change password</h2>
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            required
            value={passwords.newPassword}
            onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            required
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          />
          <Button type="submit" variant="secondary" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
