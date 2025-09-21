import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'mock-token',
    })
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'mock-token',
    })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    })
  }),

  // Tasks endpoints
  http.get('/api/tasks', () => {
    return HttpResponse.json({
      tasks: [
        {
          id: '1',
          title: 'Test Task 1',
          description: 'Description for test task 1',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Test Task 2',
          description: 'Description for test task 2',
          status: 'completed',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 2,
    })
  }),

  http.post('/api/tasks', () => {
    return HttpResponse.json({
      id: '3',
      title: 'New Task',
      description: 'New task description',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),

  http.put('/api/tasks/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Updated Task',
      description: 'Updated description',
      status: 'completed',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete('/api/tasks/:id', () => {
    return HttpResponse.json({ success: true })
  }),
]