import { FadeInUp } from '../components/ui/MotionWrapper';
import { LectureRecorder } from '../components/LectureRecorder';

export default function RecordPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <FadeInUp>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">New Recording</h1>
                    <p className="text-foreground-secondary mt-1 max-w-2xl text-sm md:text-base">
                        Record and auto-transcribe your lecture live in the browser. For best results, we recommend using the desktop app overlay.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto py-8">
                    <LectureRecorder />
                </div>
            </FadeInUp>
        </div>
    );
}
