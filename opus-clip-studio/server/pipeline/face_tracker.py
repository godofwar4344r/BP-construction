"""
Computer Vision Face Tracking & Dynamic 9:16 Reframing Engine.
Tracks active speakers across frames and computes smooth camera pan trajectories.
"""

import cv2
import numpy as np
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("FaceTracker")

class FaceTracker:
    def __init__(self, target_aspect_ratio: Tuple[int, int] = (9, 16), smoothing_factor: float = 0.85):
        self.target_aspect_ratio = target_aspect_ratio
        self.smoothing_factor = smoothing_factor

    def track_and_reframe(
        self, 
        video_path: str, 
        start_time: float = 0.0, 
        end_time: float = None,
        sample_fps: int = 15
    ) -> Dict[str, Any]:
        """
        Calculates frame-by-frame crop window coordinates [crop_x, crop_y, crop_w, crop_h]
        for 9:16 vertical conversion.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file {video_path}")

        orig_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        orig_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

        # Calculate 9:16 crop width based on full video height
        crop_w = int(orig_h * (self.target_aspect_ratio[0] / self.target_aspect_ratio[1]))
        if crop_w > orig_w:
            crop_w = orig_w
        crop_h = orig_h

        # Default center crop
        default_center_x = orig_w // 2
        prev_center_x = default_center_x

        # Load OpenCV Haar cascade face detector
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)

        crop_timeline = []
        frame_idx = 0
        
        # Seek to start
        if start_time > 0:
            cap.set(cv2.CAP_PROP_POS_MSEC, start_time * 1000)

        logger.info(f"Running face detection and trajectory smoothing on {video_path}...")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_sec = (frame_idx / fps) + start_time
            if end_time and current_sec > end_time:
                break

            # Run detection every 2nd or 3rd frame for speed
            if frame_idx % 2 == 0:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=4, minSize=(60, 60))

                if len(faces) > 0:
                    # Target largest face in frame (main speaker)
                    largest_face = max(faces, key=lambda f: f[2] * f[3])
                    fx, fy, fw, fh = largest_face
                    detected_center_x = fx + (fw // 2)
                else:
                    detected_center_x = prev_center_x

                # Smooth camera transition with exponential moving average
                smoothed_center_x = int(self.smoothing_factor * prev_center_x + (1 - self.smoothing_factor) * detected_center_x)
                prev_center_x = smoothed_center_x
            else:
                smoothed_center_x = prev_center_x

            # Clamp crop window so it stays within frame boundaries
            crop_x1 = max(0, min(smoothed_center_x - (crop_w // 2), orig_w - crop_w))
            
            crop_timeline.append({
                "time": round(current_sec, 3),
                "crop_x": crop_x1,
                "crop_y": 0,
                "crop_w": crop_w,
                "crop_h": crop_h
            })

            frame_idx += 1

        cap.release()

        return {
            "orig_width": orig_w,
            "orig_height": orig_h,
            "crop_width": crop_w,
            "crop_height": crop_h,
            "timeline": crop_timeline
        }
