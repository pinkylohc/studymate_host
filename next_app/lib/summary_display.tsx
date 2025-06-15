
//handle different summary content type
export const summaryDisplay = (section: any, index: number) => {
    switch (section.type) {
        case 'heading':
            return <h1 className="text-2xl text-center font-bold" key={index}>{section.content}</h1>;
        case 'subheading':
            return <h2 className="text-lg font-semibold" key={index}>{section.content}</h2>;
        case 'body':
            return <p className="text-base" key={index}>{section.content}</p>;
        case 'point':
            return (
                <ul className="list-disc list-inside" key={index}>
                    {section.content.map((item: string, itemIndex: number) => (
                        <li key={itemIndex}>{item}</li>
                    ))}
                </ul>
            );
        case 'code':
            return ( 
                <pre key={index} className="bg-gray-200 p-2 text-sm overflow-y-auto">
                    <code>{section.content}</code>
                </pre>
            );
        default:
            return <div key={index}>{section.content}</div>;
    }
};