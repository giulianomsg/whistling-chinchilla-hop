
export interface SetState {
    weight: string;
    reps: string;
}

export interface SessionState {
    [exerciseId: string]: {
        [setNumber: number]: SetState;
    };
}

const getStorageKey = (sessionId: string) => `capifit_in_progress_${sessionId}`;

export const getSessionState = (sessionId: string): SessionState => {
    if (!sessionId) return {};
    try {
        const item = localStorage.getItem(getStorageKey(sessionId));
        return item ? JSON.parse(item) : {};
    } catch (e) {
        console.error("Failed to load session state", e);
        return {};
    }
};

export const getSetState = (sessionId: string, exerciseId: string, setNumber: number): SetState | null => {
    const sessionState = getSessionState(sessionId);
    return sessionState[exerciseId]?.[setNumber] || null;
};

export const saveSetState = (sessionId: string, exerciseId: string, setNumber: number, data: Partial<SetState>) => {
    if (!sessionId || !exerciseId) return;

    try {
        const key = getStorageKey(sessionId);
        const currentSessionState = getSessionState(sessionId);

        // Ensure exercise object exists
        if (!currentSessionState[exerciseId]) {
            currentSessionState[exerciseId] = {};
        }

        // Ensure set object exists
        if (!currentSessionState[exerciseId][setNumber]) {
            currentSessionState[exerciseId][setNumber] = { weight: '', reps: '' };
        }

        // Merge new data
        currentSessionState[exerciseId][setNumber] = {
            ...currentSessionState[exerciseId][setNumber],
            ...data
        };

        localStorage.setItem(key, JSON.stringify(currentSessionState));
    } catch (e) {
        console.error("Failed to save set state", e);
    }
};

export const clearSessionState = (sessionId: string) => {
    if (!sessionId) return;
    try {
        localStorage.removeItem(getStorageKey(sessionId));
    } catch (e) {
        console.error("Failed to clear session state", e);
    }
};
