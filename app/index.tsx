import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Id } from "../convex/_generated/dataModel";

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function HomeScreen() {
  const [isDark, setIsDark] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState<Id<"todos"> | null>(null);
  const [editText, setEditText] = useState('');

  // Convex hooks
  // const todos = useQuery(api.todos.getTodos) || [];
  const todos = useQuery(api.todos.getTodos) as { _id: Id<"todos">; title: string; completed: boolean }[] || [];
  const addTodo = useMutation(api.todos.addTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const clearCompletedMutation = useMutation(api.todos.clearCompleted);
  const seedDefaultTodos = useMutation(api.todos.seedDefaultTodos);
  const reorderTodos = useMutation(api.todos.reorderTodos);
  const updateTodo = useMutation(api.todos.updateTodo);

  useEffect(() => {
    loadThemePreference();
    seedDefaultData();
  }, []);

  const seedDefaultData = async () => {
    // Only seed if there are no todos
    if (todos.length === 0) {
      try {
        await seedDefaultTodos();
      } catch (error) {
        console.error('Error seeding default todos:', error);
      }
    }
  };

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const handleAddTodo = async () => {
    if (input.trim()) {
      try {
        await addTodo({ title: input.trim() });
        setInput('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const handleToggleTodo = async (id: any) => {
    try {
      await toggleTodo({ id });
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: any) => {
    try {
      await deleteTodo({ id });
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };
  

  const handleClearCompleted = async () => {
    try {
      await clearCompletedMutation();
    } catch (error) {
      console.error('Error clearing completed todos:', error);
    }
  };

  const handleDragEnd = async ({ data }: any) => {
    try {
      const orderedIds = data.map((todo: any) => todo._id);
      await reorderTodos({ orderedIds });
    } catch (error) {
      console.error('Error reordering todos:', error);
    }
  };

const handleStartEdit = (id: Id<"todos">, currentTitle: string) => {
  setEditingId(id);
  setEditText(currentTitle);
};


  // const handleSaveEdit = async () => {
  //   if (editingId && editText.trim()) {
  //     try {
  //       await updateTodo({ id: editingId, title: editText.trim() });
  //       setEditingId(null);
  //       setEditText('');
  //     } catch (error) {
  //       console.error('Error updating todo:', error);
  //     }
  //   }
  // };


const handleSaveEdit = async () => {
  if (editingId && editText.trim()) {
    try {
      await updateTodo({ id: editingId, title: editText.trim() });
      // Wait briefly to let Convex update and re-render
      setTimeout(() => {
        setEditingId(null);
        setEditText('');
      }, 100);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  } else {
    setEditingId(null);
  }
};

  // const handleCancelEdit = () => {
  //   setEditingId(null);
  //   setEditText('');
  // };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const itemsLeft = todos.filter(t => !t.completed).length;

  const theme = isDark ? darkTheme : lightTheme;

  // Loading state
  if (todos === undefined) {
    return (
      <View style={[styles.wrapper, styles.centerContent, { backgroundColor: theme.bgColor }]}>
        <ActivityIndicator size="large" color={theme.activeFilter} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.wrapper, { backgroundColor: theme.bgColor }]}>
        <Image 
          source={isDark 
            ? require('../assets/images/mountain-bg-dark.jpg') 
            : require('../assets/images/mountain-bg.jpg')
          } 
          style={styles.headerImage} 
        />

        <View style={styles.content}>
          <View style={[styles.titleRow, { marginTop: isMobile ? 48 : 70 }]}>
            <Text style={[styles.title, isMobile && styles.titleMobile]}>TODO</Text>
            <TouchableOpacity onPress={toggleTheme}>
              <Image 
                source={isDark 
                  ? require('../assets/images/sun-icon.png')
                  : require('../assets/images/moon-icon.png')
                } 
                style={[styles.themeIcon, isMobile && styles.themeIconMobile]}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.cardBg }]}>
            <View style={[styles.checkboxPlaceholder, { borderColor: theme.checkboxBorder }]} />
            <TextInput
              style={[styles.input, { color: theme.textColor }, isMobile && styles.inputMobile]}
              placeholder="Create a new todo..."
              placeholderTextColor={theme.placeholderColor}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleAddTodo}
            />
          </View>

          {/* Todo list container */}
          <View style={[styles.todoContainer, { backgroundColor: theme.cardBg }]}>
            {filteredTodos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.mutedColor }]}>
                  {filter === 'completed' 
                    ? 'No completed todos yet' 
                    : filter === 'active'
                    ? 'No active todos'
                    : 'No todos yet. Add one above!'}
                </Text>
              </View>
            ) : (
              <DraggableFlatList
                data={filteredTodos}
                keyExtractor={(item) => item._id}
                onDragEnd={handleDragEnd}
                renderItem={({ item, drag, isActive, getIndex }) => {
                  const index = getIndex();
                  return (
                    <ScaleDecorator>
                      <Pressable
                        onLongPress={drag}
                        disabled={isActive || editingId === item._id}
                        onHoverIn={() => setHoveredId(item._id)}
                        onHoverOut={() => setHoveredId(null)}
                        onPress={() => editingId !== item._id && handleToggleTodo(item._id)}
                        style={[
                          styles.todoItem,
                          isActive && styles.draggingItem,
                          index !== filteredTodos.length - 1 && { 
                            borderBottomWidth: 1, 
                            borderBottomColor: theme.borderColor 
                          }
                        ]}
                      >
                      <View style={[
                        styles.checkbox,
                        // item.completed && styles.checkboxCompleted,
                        { borderColor: theme.checkboxBorder }
                      ]}>
                        {item.completed && (
                          <Image 
                            source={require('../assets/images/tick.png')} 
                            // style={styles.checkmarkIcon}
                          />
                        )}
                      </View>
                      
                      {editingId === item._id ? (
                        <TextInput
                          style={[
                            styles.todoText,
                            styles.editInput,
                            { color: theme.textColor },
                            isMobile && styles.todoTextMobile
                          ]}
                          value={editText}
                          onChangeText={setEditText}
                          onSubmitEditing={handleSaveEdit}
                          onBlur={handleSaveEdit}
                          autoFocus
                        />
                      ) : (
                        <Text style={[
                          styles.todoText,
                          { color: theme.textColor },
                          item.completed && styles.todoTextCompleted,
                          isMobile && styles.todoTextMobile
                        ]}>
                          {item.title}
                        </Text>
                      )}
                      
                      {/*This is the Edit and Delete buttons - always visible on mobile, hover only on web */}
                      {(isMobile || hoveredId === item._id) && editingId !== item._id && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={styles.editButton}
                            onPress={(e) => {
                              e?.stopPropagation?.();
                              handleStartEdit(item._id, item.title);
                            }}
                          >
                            <Image 
                              source={require('../assets/images/edit-icon.png')} 
                              style={[styles.editIcon, { tintColor: theme.mutedColor }]}
                            />
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={(e) => {
                              e?.stopPropagation?.();
                              handleDeleteTodo(item._id);
                            }}
                          >
                            <Text style={[styles.deleteIcon, { color: theme.mutedColor }]}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      
                      {/* Save button after and when editing */}
                      {editingId === item._id && (
                        <TouchableOpacity 
                          style={styles.saveButton}
                          onPress={handleSaveEdit}
                        >
                          <Text style={[styles.saveText, { color: theme.activeFilter }]}>Save</Text>
                        </TouchableOpacity>
                      )}
                    </Pressable>
                  </ScaleDecorator>
                  );
                }}
              />
            )}
            
            {/* Footer with filters - desktop layout */}
            {!isMobile && (
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.mutedColor }]}>
                  {itemsLeft} items left
                </Text>
                
                <View style={styles.filterButtons}>
                  <TouchableOpacity onPress={() => setFilter('all')}>
                    <Text style={[
                      styles.filterText,
                      { color: filter === 'all' ? theme.activeFilter : theme.mutedColor }
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFilter('active')}>
                    <Text style={[
                      styles.filterText,
                      { color: filter === 'active' ? theme.activeFilter : theme.mutedColor }
                    ]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFilter('completed')}>
                    <Text style={[
                      styles.filterText,
                      { color: filter === 'completed' ? theme.activeFilter : theme.mutedColor }
                    ]}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleClearCompleted}>
                  <Text style={[styles.footerText, { color: theme.mutedColor }]}>
                    Clear Completed
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Footer with filters - mobile layout */}
            {isMobile && (
              <View style={styles.footerMobile}>
                <Text style={[styles.footerText, { color: theme.mutedColor }]}>
                  {itemsLeft} items left
                </Text>
                <TouchableOpacity onPress={handleClearCompleted}>
                  <Text style={[styles.footerText, { color: theme.mutedColor }]}>
                    Clear Completed
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Mobile filter buttons - separate card */}
          {isMobile && (
            <View style={[styles.mobileFilterContainer, { backgroundColor: theme.cardBg }]}>
              <View style={styles.filterButtons}>
                <TouchableOpacity onPress={() => setFilter('all')}>
                  <Text style={[
                    styles.filterText,
                    { color: filter === 'all' ? theme.activeFilter : theme.mutedColor }
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('active')}>
                  <Text style={[
                    styles.filterText,
                    { color: filter === 'active' ? theme.activeFilter : theme.mutedColor }
                  ]}>
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('completed')}>
                  <Text style={[
                    styles.filterText,
                    { color: filter === 'completed' ? theme.activeFilter : theme.mutedColor }
                  ]}>
                    Completed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <Text style={[styles.dragText, { color: theme.mutedColor }]}>
            Drag and drop to reorder list
          </Text>
        
          
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const lightTheme = {
  bgColor: '#fafafa',
  cardBg: '#ffffff',
  textColor: '#494c6b',
  placeholderColor: '#9495a5',
  mutedColor: '#9495a5',
  borderColor: '#e3e4f1',
  checkboxBorder: '#e3e4f1',
  activeFilter: '#3a7cfd',
};

const darkTheme = {
  bgColor: '#171823',
  cardBg: '#25273d',
  textColor: '#c8cbe7',
  placeholderColor: '#767992',
  mutedColor: '#5b5e7e',
  borderColor: '#393a4b',
  checkboxBorder: '#393a4b',
  activeFilter: '#3a7cfd',
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
  },
  headerImage: {
    width: '100%',
    height: isMobile ? 250 : 300,
    resizeMode: 'cover',
  },
  content: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: isMobile ? 20 : 24,
    width: '100%',
    maxWidth: 541,
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMobile ? 32 : 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 15,
  },
  titleMobile: {
    fontSize: 28,
    letterSpacing: 10,
  },
  themeIcon: {
    width: 26,
    height: 26,
  },
  themeIconMobile: {
    width: 20,
    height: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: isMobile ? 14 : 18,
    marginBottom: isMobile ? 16 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  checkboxPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    padding: 0,
      outlineColor: 'transparent', 
  },
  inputMobile: {
    fontSize: 12,
  },
  todoContainer: {
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    minHeight: 60,
    maxHeight: isMobile ? 400 : 500,
  },
  scrollableList: {
    maxHeight: isMobile ? 350 : 450,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: isMobile ? 14 : 16,
    textAlign: 'center',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 16 : 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // checkboxCompleted: {
  //   backgroundColor: '#5fd4ff',
  //   borderColor: '#5fd4ff',
  // },
  // checkmark: {
  //   color: '#ffffff',
  //   fontSize: 10,
  //   fontWeight: 'bold',
  // },
  // checkmarkIcon: {
  //   width: 11,
  //   height: 9,
  //   resizeMode: 'contain',
  // },
  todoText: {
    fontSize: 18,
    flex: 1,
  },
  todoTextMobile: {
    fontSize: 12,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
    fontWeight: '300',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  editIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  editInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#3a7cfd',
    paddingVertical: 2,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
  },
  draggingItem: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  footerMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: isMobile ? 12 : 14,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: isMobile ? 16 : 18,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  mobileFilterContainer: {
    borderRadius: 5,
    marginTop: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  dragText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 14,
  },
});
