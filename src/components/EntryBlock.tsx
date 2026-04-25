import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { JournalEntry, Mood } from '../types';
import { useState } from 'react';

const moodConfig: Record<Mood, { emoji: string, color: string }> = {
  Happy: { emoji: '🌿', color: '#E8F5E9' },
  Calm: { emoji: '✨', color: '#FFF8E1' },
  Sad: { emoji: '☁️', color: '#ECEFF1' },
  Excited: { emoji: '🌸', color: '#FCE4EC' },
  Tired: { emoji: '🌙', color: '#FFF3E0' },
};

interface EntryBlockProps {
  entry: JournalEntry;
  onUpdate?: (newContent: string) => void;
  onDelete?: () => void;
}

export default function EntryBlock({ entry, onUpdate, onDelete }: EntryBlockProps) {
  const config = moodConfig[entry.mood] || { emoji: '😐', color: '#F3F4F6' };
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);

  const createdDate = new Date(entry.createdAt);
  const updatedDate = new Date(entry.updatedAt);
  
  // Enforce explicit 12-hour AM/PM format overriding any system locale defaults
  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const timeString = createdDate.toLocaleTimeString('en-US', timeOptions);
  
  // If the 'updatedAt' is more than 60 seconds after 'createdAt', we consider it edited.
  const isEdited = (updatedDate.getTime() - createdDate.getTime()) > 60000;
  
  const updatedDateString = updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const updatedTimeString = updatedDate.toLocaleTimeString('en-US', timeOptions);
  
  const displayTime = isEdited ? `${timeString}  •  edited ${updatedDateString}, ${updatedTimeString}` : timeString;

  const handleSave = () => {
    if (editContent.trim() && onUpdate) {
      onUpdate(editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: config.color }]}>
          <Text style={styles.badgeEmoji}>{config.emoji}</Text>
          <Text style={styles.badgeText}>{entry.mood}</Text>
        </View>

        {!isEditing && onUpdate && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editor}>
          <TextInput 
            style={styles.textInput}
            multiline
            value={editContent}
            onChangeText={setEditContent}
            autoFocus
          />
          <View style={styles.actions}>
            {onDelete ? (
              <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            ) : <View />}
            
            <View style={styles.saveActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtn, !editContent.trim() && { opacity: 0.5 }]} 
                onPress={handleSave}
                disabled={!editContent.trim()}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.content}>{entry.content}</Text>
          <Text style={styles.time}>{displayTime}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  editBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    padding: 4,
  },
  content: {
    fontSize: 17,
    lineHeight: 28,
    color: '#374151',
    marginBottom: 16,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  editor: {
    marginTop: 8,
  },
  textInput: {
    fontSize: 17,
    lineHeight: 28,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  saveActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cancelBtn: {
    padding: 8,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveBtn: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444', 
  }
});
