async function testChat() {
  console.log('Testing /api/chat endpoint...\n');

  const testMessage = {
    messages: [
      {
        id: 'test-message-1',
        role: 'user',
        content: 'Say hello!'
      }
    ],
    modelId: 'anthropic/claude-sonnet-4.5'
  };

  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    console.log('\n✅ API responded successfully\n');

    // Read a small portion of the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunks = 0;

    while (chunks < 3) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      if (chunk.trim()) {
        console.log('Stream chunk:', chunk.substring(0, 100) + '...');
        chunks++;
      }
    }

    reader.cancel();
    console.log('\n✅ Stream working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChat();
