'use client'

import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { IoIosShareAlt } from "react-icons/io";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
    function share() {
        navigator.share({
            title: 'I\'m Hungry',
            text: 'Lets figure out where to eat tonight!',
            url: window.location.href,
        }).catch(() => {
            // share cancelled
        })
    }
    return (
        <main className="h-full">
            <div className="fixed top-0 flex justify-between items-center w-full">
                <Link href="/" className="p-4 inline-block  opacity-30 hover:opacity-100 transition"><BsArrowLeft className="w-6 h-6" /></Link>
                <button onClick={share} className="p-4 inline-block  opacity-30 hover:opacity-100 transition cursor-pointer"><IoIosShareAlt className="w-6 h-6" /></button>
            </div>
            {children}
        </main>
    )
}