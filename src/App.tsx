import React, {useEffect, useRef, useState} from "react";
import "./App.css";

declare global {
    interface Window {
        alphaTab: any
    }
}

export default function App() {
    const ref = useRef(null);
    const apiRef = useRef<any>(null);
    const fileRef = useRef<any>(null);
    const [loaded, setLoaded] = useState(false);

    async function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setLoaded(false);
        await new Promise<void>((resolve, reject) => {
            const reader: FileReader = new FileReader()
            reader.readAsArrayBuffer(fileRef.current.files[0]);
            reader.onloadend = (e: ProgressEvent<FileReader>) => {
                if (e.target === null) return reject()
                const target: any = e.target

                if (target.readyState == FileReader.DONE) {
                    const arrayBuffer: Uint8Array = new Uint8Array(target.result)
                    return apiRef.current.load(arrayBuffer) ? resolve() : reject()
                }
            }
        })
        setLoaded(true);
    }

    useEffect(() => {
        apiRef.current = new window.alphaTab.AlphaTabApi(ref.current, {
            core: {
                tex: true,
                engine: "html5",
                logLevel: 1,
                useWorkers: true
            },
            display: {
                staveProfile: "Default",
                resources: {
                    // staffLineColor: "rgb(200, 10, 110)"
                }
            },
            notation: {
                elements: {
                    scoreTitle: false,
                    scoreWordsAndMusic: false,
                    effectTempo: true,
                    guitarTuning: false
                }
            },
            player: {
                scrollMode: "off",
                enablePlayer: true,
                enableUserInteraction: true,
                enableCursor: true,
                soundFont: `https://cdn.jsdelivr.net/npm/@coderline/alphatab@alpha/dist/soundfont/sonivox.sf2`
            }
        });

        apiRef.current.soundFontLoaded.on(() => {
            setLoaded(true);
        });

        return () => {
            apiRef.current.destroy();
        }
    }, []);

    return (
        <div className="App">
            <form onSubmit={handleSubmit}>
                <label>
                    Pick a tab:
                    <input required type="file" ref={fileRef}/>
                </label>
                <br/>
                <button type="submit">Load</button>
            </form>
            <button
                onClick={() => {
                    apiRef.current.play();
                }}
                disabled={!loaded}
            >
                play
            </button>
            <button
                onClick={() => {
                    apiRef.current.pause();
                }}
                disabled={!loaded}
            >
                pause
            </button>
            <div ref={ref}></div>
        </div>
    );
}
