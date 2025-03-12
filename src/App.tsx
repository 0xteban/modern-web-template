import { useState } from 'react'
import { supabase } from './lib/supabase'
import { openai } from './lib/openai'

function App() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSupabaseTest = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('test').select('*')
      if (error) throw error
      console.log('Supabase connection successful:', data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAITest = async () => {
    try {
      setLoading(true)
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello!' }],
        model: 'gpt-3.5-turbo',
      })
      setMessage(completion.choices[0]?.message?.content || '')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card">
          <h1 className="text-3xl font-bold mb-8">Modern Web Template</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Supabase Integration</h2>
              <button 
                onClick={handleSupabaseTest}
                disabled={loading}
                className="btn-primary"
              >
                Test Supabase Connection
              </button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">OpenAI Integration</h2>
              <button 
                onClick={handleAITest}
                disabled={loading}
                className="btn-primary"
              >
                Test AI Integration
              </button>
              {message && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p>{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
