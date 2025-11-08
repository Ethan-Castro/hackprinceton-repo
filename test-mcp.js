// Test script to verify MCP tools are working

async function testMCP() {
  console.log('Testing MCP integration...\n');

  const testMessage = {
    messages: [
      {
        id: 'test-message-1',
        role: 'user',
        parts: [
          {
            type: 'text',
            text: 'What are the health benefits of vitamin D? Please research this topic.'
          }
        ]
      }
    ],
    modelId: 'anthropic/claude-sonnet-4.5'
  };

  try {
    const response = await fetch('http://localhost:3001/api/health-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    console.log('\n✅ API responded successfully');
    console.log('📝 Check server logs for MCP tool usage\n');

    // Read a small portion of the stream to verify it's working
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunks = 0;

    while (chunks < 5) {
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

testMCP();
