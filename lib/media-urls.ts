const q = "auto=format&fit=crop&q=80";
export const fitnessImages = {
    heroGym: `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?${q}&w=1400&h=900`,
    heroCoach: `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?${q}&w=1400&h=900`,
    heroSession: `https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?${q}&w=1200&h=800`,
    gymFloor: `https://images.unsplash.com/photo-1540497077202-7c8a3999166f?${q}&w=1200&h=700`,
    dumbbells: `https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?${q}&w=900&h=600`,
    stretch: `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?${q}&w=900&h=600`,
    track: `https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?${q}&w=1200&h=700`,
    coachClipboard: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?${q}&w=1000&h=700`,
    cityAerial: `https://images.unsplash.com/photo-1514565131-fce0801e5785?${q}&w=1200&h=600`,
    deskDocument: `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?${q}&w=1200&h=600`,
} as const;
const trainerFaces = [
    `https://images.unsplash.com/photo-1494790108377-be9c29b29330?${q}&w=128&h=128`,
    `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?${q}&w=128&h=128`,
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?${q}&w=128&h=128`,
    `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${q}&w=128&h=128`,
    `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?${q}&w=128&h=128`,
    `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?${q}&w=128&h=128`,
] as const;
export function faceUrlForSeed(seed: string): string {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return trainerFaces[h % trainerFaces.length];
}
export const trainerAvatarUrls = [...trainerFaces] as readonly string[];
