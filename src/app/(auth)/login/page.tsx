import { LoginForm } from "@/components/auth/login-form";
import { ImageCarousel } from "@/components/auth/image-carousel";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Login Form */}
            <div className="flex w-full flex-col justify-center bg-white md:w-1/2">
                <LoginForm />
            </div>

            {/* Right Panel - Image Carousel (hidden on mobile) */}
            <div className="hidden md:block md:w-1/2">
                <ImageCarousel />
            </div>
        </div>
    );
}
