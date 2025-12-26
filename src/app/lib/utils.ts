
export const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}`;
};

export const generateRoomCode = () =>
    Math.random().toString(36).substring(2, 7).toUpperCase();
