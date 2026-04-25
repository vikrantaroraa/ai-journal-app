import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import { JournalEntry, Mood } from '../types';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

const moodConfig: Record<Mood, { emoji: string, color: string }> = {
  Happy: { emoji: '🌿', color: '#E8F5E9' },
  Calm: { emoji: '✨', color: '#FFF8E1' },
  Sad: { emoji: '☁️', color: '#ECEFF1' },
  Excited: { emoji: '🌸', color: '#FCE4EC' },
  Tired: { emoji: '🌙', color: '#FFF3E0' },
};

interface EntryBlockProps {
  entry: JournalEntry;
  onUpdate?: (newContent: string, newImages?: string[]) => void;
  onDelete?: () => void;
}

export default function EntryBlock({ entry, onUpdate, onDelete }: EntryBlockProps) {
  const config = moodConfig[entry.mood] || { emoji: '😐', color: '#F3F4F6' };
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [editImages, setEditImages] = useState<string[]>(entry.images || []);

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

  const handleStartEdit = () => {
    setEditContent(entry.content);
    setEditImages(entry.images || []);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editContent.trim() && onUpdate) {
      onUpdate(editContent.trim(), editImages.length > 0 ? editImages : undefined);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setEditImages(entry.images || []);
    setIsEditing(false);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setEditImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: config.color }]}>
          <Text style={styles.badgeEmoji}>{config.emoji}</Text>
          <Text style={styles.badgeText}>{entry.mood}</Text>
        </View>

        {!isEditing && onUpdate && (
          <TouchableOpacity onPress={handleStartEdit}>
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

          {/* Image editing strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.editImageStrip}>
            {editImages.map((uri, idx) => (
              <View key={idx} style={styles.editImageWrapper}>
                <Image source={{ uri }} style={styles.editImageThumb} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => handleRemoveImage(idx)}>
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageBtn} onPress={handlePickImage}>
              <Text style={styles.addImageIcon}>📸</Text>
              <Text style={styles.addImageLabel}>Add</Text>
            </TouchableOpacity>
          </ScrollView>

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
          {entry.images && entry.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {entry.images.map((uri, idx) => (
                <Image 
                  key={idx}
                  source={{ uri }} 
                  style={styles.attachedImageBlock} 
                  resizeMode="cover" 
                />
              ))}
            </ScrollView>
          )}
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
  },
  editImageStrip: {
    marginTop: 12,
    marginBottom: 4,
  },
  editImageWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  editImageThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addImageBtn: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageIcon: {
    fontSize: 18,
  },
  addImageLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  imageScroll: {
    marginBottom: 16,
  },
  attachedImageBlock: {
    width: 250,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  }
});
