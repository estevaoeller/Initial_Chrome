// js/toggl.js

const BASE_URL = 'https://api.track.toggl.com/api/v9';

// Utility to create Basic Auth header
function getAuthHeader(token) {
    // Toggl uses token:api_token for basic auth
    const authString = btoa(`${token}:api_token`);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
    };
}

/**
 * Verify token and return the user's default workspace ID.
 */
export async function verifyTogglToken(token) {
    if (!token) return { success: false, error: 'Token não fornecido' };

    try {
        const response = await fetch(`${BASE_URL}/me`, {
            method: 'GET',
            headers: getAuthHeader(token)
        });

        if (!response.ok) {
            return { success: false, error: 'Token inválido ou erro de conexão' };
        }

        const data = await response.json();
        return { success: true, workspaceId: data.default_workspace_id, data: data };
    } catch (error) {
        console.error('Toggl API Error (verify):', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch projects for a workspace
 */
export async function getTogglProjects(token, workspaceId) {
    if (!token || !workspaceId) return { success: false, error: 'Token ou WorkspaceID ausente' };

    try {
        const response = await fetch(`${BASE_URL}/workspaces/${workspaceId}/projects`, {
            method: 'GET',
            headers: getAuthHeader(token)
        });

        if (!response.ok) {
            return { success: false, error: 'Erro ao buscar projetos' };
        }

        const data = await response.json();
        // Toggl returns an array of projects, filter only active ones
        const activeProjects = data.filter(p => p.active !== false);
        return { success: true, projects: activeProjects };
    } catch (error) {
        console.error('Toggl API Error (projects):', error);
        return { success: false, error: error.message };
    }
}

/**
 * Starts a new time entry
 */
export async function startTogglTimer(token, workspaceId, description, projectId = null) {
    if (!token || !workspaceId) return { success: false, error: 'Autenticação ou Workspace ausente' };

    try {
        const payload = {
            description: description || 'Pomodoro Timer Focus',
            workspace_id: workspaceId,
            tags: ['Pomodoro'], // Optional tag
            start: new Date().toISOString(),
            duration: -1, // Toggl v9 active timer format requires running timer to have duration = -1
            created_with: 'Custom New Tab Extension'
        };

        if (projectId && projectId !== 'none') {
            payload.project_id = parseInt(projectId, 10);
        }

        const response = await fetch(`${BASE_URL}/workspaces/${workspaceId}/time_entries`, {
            method: 'POST',
            headers: getAuthHeader(token),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            return { success: false, error: 'Erro ao iniciar cronômetro no Toggl' };
        }

        const data = await response.json();
        return { success: true, timeEntryId: data.id, entry: data };
    } catch (error) {
        console.error('Toggl API Error (start timer):', error);
        return { success: false, error: error.message };
    }
}

/**
 * Stops an active time entry
 */
export async function stopTogglTimer(token, workspaceId, timeEntryId) {
    if (!token || !workspaceId || !timeEntryId) return { success: false, error: 'Dados insuficientes para parar timer' };

    try {
        const response = await fetch(`${BASE_URL}/workspaces/${workspaceId}/time_entries/${timeEntryId}/stop`, {
            method: 'PATCH',
            headers: getAuthHeader(token)
        });

        if (!response.ok) {
            return { success: false, error: 'Erro ao parar cronômetro no Toggl' };
        }

        const data = await response.json();
        return { success: true, entry: data };
    } catch (error) {
        console.error('Toggl API Error (stop timer):', error);
        return { success: false, error: error.message };
    }
}
