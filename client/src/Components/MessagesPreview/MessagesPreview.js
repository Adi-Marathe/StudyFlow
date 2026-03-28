import { useState, useEffect } from 'react';
import './MessagesPreview.css';

function MessagesPreview() {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    const FALLBACK_QUOTES = [
        { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
        { q: "It always seems impossible until it's done.", a: "Nelson Mandela" },
        { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
        { q: "Hard work beats talent when talent doesn't work hard.", a: "Tim Notke" },
        { q: "Success is the sum of small efforts repeated day in and day out.", a: "Robert Collier" },
        { q: "Don't watch the clock; do what it does. Keep going.", a: "Sam Levenson" },
    ];

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const res = await fetch('https://zenquotes.io/api/random');
                const data = await res.json();
                if (data && data[0]) {
                    setQuote({ q: data[0].q, a: data[0].a });
                } else {
                    throw new Error('No data');
                }
            } catch {
                const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
                setQuote(random);
            } finally {
                setLoading(false);
            }
        };

        fetchQuote();
    }, []);

    return (
        <div className='MessagesPreview-Container'>
            <h2 className='MessagesPreview-title'>Messages</h2>
            <div className='MessagesPreview-main'>
                {loading ? (
                    <div className='quote-loading'>
                        <div className='quote-dot'></div>
                        <div className='quote-dot'></div>
                        <div className='quote-dot'></div>
                    </div>
                ) : (
                    <div className='quote-wrapper'>
                        <span className='quote-mark'>"</span>
                        <p className='quote-text'>{quote?.q}</p>
                        <p className='quote-author'>— {quote?.a}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPreview;