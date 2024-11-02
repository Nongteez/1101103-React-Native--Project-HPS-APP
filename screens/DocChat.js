import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';

const DocChatScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'doc', text: 'หมอครับผมโดนจับ ช่วยผมด้วย!!' }
  ]);

  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() !== '') {
      const newMessage = { id: messages.length + 1, sender: 'user', text: inputText };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {messages.map(message => (
          <View key={message.id} style={{ alignItems: message.sender === 'doc' ? 'flex-start' : 'flex-end' }}>
            <View style={{ backgroundColor: message.sender === 'doc' ? '#e5e5ea' : '#007aff', padding: 10, borderRadius: 10, margin: 5 }}>
              <Text style={{ color: message.sender === 'doc' ? '#000' : '#fff' }}>{message.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 }}>
        <TextInput
          style={{ flex: 1, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 10 }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

export default DocChatScreen;
