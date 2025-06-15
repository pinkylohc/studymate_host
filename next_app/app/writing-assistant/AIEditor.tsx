"use client";

import { AiEditor, AiEditorOptions, OpenaiModelConfig } from "aieditor";
import "aieditor/dist/style.css";
import { HTMLAttributes, forwardRef, useEffect, useRef } from "react";

type AIEditorProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  options?: Omit<AiEditorOptions, "element">;
  lang?: string;
};

const AIEditor = forwardRef<HTMLDivElement, AIEditorProps>(function AIEditor(
  {
    placeholder,
    defaultValue,
    value,
    onChange,
    options,
    lang = "en",
    ...props
  }: AIEditorProps,
  ref
) {
  const divRef = useRef<HTMLDivElement>(null);
  const aiEditorRef = useRef<AiEditor | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    if (!aiEditorRef.current) {
      const openaiConfig: OpenaiModelConfig = {
        endpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT || "https://yunwu.ai",
        model: process.env.NEXT_PUBLIC_AI_MODEL || "gpt-4o-2024-11-20",
        apiKey: process.env.NEXT_PUBLIC_AI_KEY
      };

      const aiEditor = new AiEditor({
        element: divRef.current,
        placeholder: placeholder,
        content: defaultValue || value,
        lang: lang,
        draggable: false,
        onChange: (ed) => {
          if (typeof onChange === "function") {
            onChange(ed.getMarkdown());
          }
        },
        ai: {
          models: {
            openai: openaiConfig
          },
          // Toolbar AI Menus
          menus: [
            {
              icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 18.9997H20V13.9997H22V19.9997C22 20.552 21.5523 20.9997 21 20.9997H3C2.44772 20.9997 2 20.552 2 19.9997V13.9997H4V18.9997ZM16.1716 6.9997L12.2218 3.04996L13.636 1.63574L20 7.9997L13.636 14.3637L12.2218 12.9495L16.1716 8.9997H5V6.9997H16.1716Z"></path></svg>`,
              name: "Continuation",
              prompt: `Continue writing from where the text ends, maintaining the same style, tone and context. Ensure the continuation flows naturally and seamlessly from the existing content. Write in original language and focus on developing the ideas further while keeping consistency with the original text's themes and arguments.`,
              text: "focusBefore",
            },
            {
              icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M15 5.25C16.7949 5.25 18.25 3.79493 18.25 2H19.75C19.75 3.79493 21.2051 5.25 23 5.25V6.75C21.2051 6.75 19.75 8.20507 19.75 10H18.25C18.25 8.20507 16.7949 6.75 15 6.75V5.25ZM4 7C4 5.89543 4.89543 5 6 5H13V3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H18C20.2091 21 22 19.2091 22 17V12H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z"></path></svg>`,
              name: "Optimize",
              prompt: `Enhance this text in ${lang} by:
                1. Strengthening word choices and eliminating redundancies
                2. Converting passive voice to active voice where appropriate
                3. Varying sentence structure and length for better rhythm
                4. Improving clarity and impact while preserving the original meaning
                5. Ensuring logical flow between paragraphs
                6. Adding transitional phrases where needed
                7. Maintaining the original tone and style
                8. Only provide the optimized text, do not provide any other information`,
              text: "selected",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.94 14.036c-.233.624-.43 1.2-.606 1.783.96-.697 2.101-1.139 3.418-1.304 2.513-.314 4.746-1.973 5.876-4.058l-1.456-1.455 1.413-1.415 1-1.001c.43-.43.915-1.224 1.428-2.368-5.593.867-9.018 4.292-11.074 9.818zM17 9.001L18 10c-1 3-4 6-8 6.5-2.669.334-4.336 2.167-5.002 5.5H3C4 16 6 2 21 2c-1 2.997-1.998 4.996-2.997 5.997L17 9.001z"/></svg>',
              name: "Proofread",
              prompt: `Thoroughly review and correct this text in ${lang}:
                1. Fix all spelling, grammar, and punctuation errors
                2. Check subject-verb agreement and verb tense consistency
                3. Ensure proper capitalization and formatting
                4. Verify correct usage of idioms and expressions
                5. Address run-on sentences and fragments
                6. Confirm proper noun and pronoun usage
                7. Validate formatting consistency
                8. Only provide the proofread text, do not provide any other information`,
              text: "selected",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM7 6h4v4H7V6zm0 6h10v2H7v-2zm0 4h10v2H7v-2zm6-9h4v2h-4V7z"/></svg>',
              name: "Summarize",
              prompt: `Create a comprehensive summary in ${lang}:
                1. Extract main ideas and key arguments
                2. Identify critical supporting evidence
                3. Highlight significant conclusions
                4. Maintain logical flow between points
                5. Use clear bullet points or numbered lists
                6. Include relevant statistics or data
                7. Preserve essential context
                8. Keep summary concise yet thorough
                9. Only provide the summary, do not provide any other information`,
              text: "selected",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 15v2a2 2 0 0 0 1.85 1.995L7 19h3v2H7a4 4 0 0 1-4-4v-2h2zm13-5l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16 10h2zm-1 2.885L15.753 16h2.492L17 12.885zM8 2v2h4v7H8v3H6v-3H2V4h4V2h2zm9 1a4 4 0 0 1 4 4v2h-2V7a2 2 0 0 0-2-2h-3V3h3zM6 6H4v3h2V6zm4 0H8v3h2V6z"/></svg>',
              name: "Translate",
              prompt: `Translate this text to ${lang}:
                1. Maintain original meaning and context
                2. Preserve tone and style
                3. Adapt idioms and cultural references appropriately
                4. Keep formatting and structure
                5. Consider target language conventions
                6. Ensure natural flow in target language
                7. Preserve emphasis and nuance
                8. Only provide the translated text, do not provide any other information`,
              text: "selected",
            }
          ],
          // AI Commands (Slash Commands)
          commands: [
            {
              icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 18.9997H20V13.9997H22V19.9997C22 20.552 21.5523 20.9997 21 20.9997H3C2.44772 20.9997 2 20.552 2 19.9997V13.9997H4V18.9997ZM16.1716 6.9997L12.2218 3.04996L13.636 1.63574L20 7.9997L13.636 14.3637L12.2218 12.9495L16.1716 8.9997H5V6.9997H16.1716Z"></path></svg>`,
              name: "Continue Writing",
              prompt: `Continue writing from where the text ends, maintaining the same style, tone and context. Ensure the continuation flows naturally and seamlessly from the existing content. Write in ${lang} and focus on developing the ideas further while keeping consistency with the original text's themes and arguments.`,
              text: "focusBefore",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
              name: "Get Answer",
              prompt: `Provide a detailed and comprehensive answer to the question by:
              1. Breaking down complex concepts into clear explanations
              2. Including relevant examples and analogies
              3. Citing credible sources when applicable
              4. Addressing potential counterarguments
              5. Providing practical applications or implications
              6. Using bullet points or numbered lists for clarity
              7. Maintaining an objective and analytical tone
              8. Offering multiple perspectives when relevant
              Write in ${lang} and ensure the response is well-structured and academically sound.`,
              text: "focusBefore",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 20H5v-2h14v2zM5 11h4v4H5v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM5 4h14v2H5V4zm0 3h4v3H5V7zm6 0h4v3h-4V7zm6 0h4v3h-4V7z"/></svg>',
              name: "Brainstorm Ideas",
              prompt: `Generate creative and comprehensive ideas related to the topic by:
              1. Exploring multiple angles and perspectives
              2. Suggesting innovative approaches
              3. Identifying potential opportunities and challenges
              4. Drawing connections to related concepts
              5. Considering practical applications
              6. Proposing unique solutions
              7. Incorporating relevant trends and developments
              8. Maintaining feasibility and relevance
              Write in ${lang} and organize ideas in a clear, structured format.`,
              text: "focusBefore",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm1.61-9.96c-2.06-.3-3.88.97-4.43 2.79-.18.58.26 1.17.87 1.17h.2c.41 0 .74-.29.88-.67.32-.89 1.27-1.5 2.3-1.28.95.2 1.65 1.13 1.57 2.1-.1 1.34-1.62 1.63-2.45 2.88 0 .01-.01.01-.01.02-.01.02-.02.03-.03.05-.09.15-.18.32-.25.5-.01.03-.03.05-.04.08-.01.02-.01.04-.02.07-.12.34-.2.75-.2 1.25h2c0-.42.11-.77.28-1.07.02-.03.03-.06.05-.09.08-.14.18-.27.28-.39.01-.01.02-.03.03-.04.1-.12.21-.23.33-.34.96-.91 2.26-1.65 1.99-3.56-.24-1.74-1.61-3.21-3.35-3.47z"/></svg>',
              name: "Explain Concept",
              prompt: `Provide a clear and comprehensive explanation of the concept by:
                1. Breaking down complex ideas into digestible parts
                2. Using clear and simple language
                3. Providing relevant examples and analogies
                4. Highlighting key principles and relationships
                5. Addressing common misconceptions
                6. Including practical applications
                7. Connecting to related concepts
                8. Using visual descriptions when helpful
                Write in ${lang} and ensure the explanation is accessible yet thorough.`,
              text: "focusBefore",
            },
            {
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>',
              name: "Translate",
              prompt: `Translate this text to ${lang} while:
                1. Preserving the original meaning and nuances
                2. Maintaining appropriate cultural context
                3. Adapting idioms and expressions naturally
                4. Ensuring proper grammar and syntax
                5. Keeping the original tone and style
                6. Using appropriate terminology
                7. Considering target audience expectations
                8. Maintaining formatting and structure
                9. Only provide the translated text, do not provide any other information`,
              text: "focusBefore",
            }
          ],
          translate: {
            prompt: (lang, selectedText) => {
              return `Translate the following text to ${lang}:

                1. Preserve original meaning and context
                2. Maintain tone and style
                3. Adapt idioms and cultural references appropriately
                4. Keep formatting and structure
                5. Consider target language conventions
                6. Ensure natural flow
                7. Preserve emphasis and nuance

                Text to translate:
                ${selectedText}

                Only provide the translated text without any additional information or explanations.`
            },
            translateMenuItems: [
              { title: 'English', language: 'English' },
              { title: 'Chinese', language: 'Chinese' },
              { title: 'Japanese', language: 'Japanese' },
              { title: 'French', language: 'French' },
              { title: 'German', language: 'German' },
              { title: 'Portuguese', language: 'Portuguese' },
              { title: 'Spanish', language: 'Spanish' },
              { title: 'Korean', language: 'Korean' },
              { title: 'Italian', language: 'Italian' },
              { title: 'Russian', language: 'Russian' },
            ],
          }, codeBlock: {
            codeComments: {
              model: "auto",
              prompt: `Add clear and concise comments to this code in ${lang}:
                1. Explain complex logic and algorithms
                2. Document function parameters and return values
                3. Clarify non-obvious implementations
                4. Highlight important code sections
                5. Describe the purpose of each major block
                6. Note any dependencies or requirements
                7. Explain any edge cases or limitations

                Return only the commented code without any additional explanations.`,
            },
            codeExplain: {
              model: "auto",
              prompt: `Explain this code in ${lang} by:
                1. Breaking down the overall functionality
                2. Describing the implementation approach
                3. Explaining key algorithms and data structures
                4. Highlighting important code patterns
                5. Identifying potential performance implications
                6. Noting any best practices or design patterns used
                7. Discussing error handling and edge cases
                8. Explaining integration points with other components

                Focus on the code logic and implementation, not the comments. Provide a clear and technical explanation.`,
            }
          },
          bubblePanelMenus: [
            {
              prompt: `<content>{content}</content>
                Enhance this text by:
                1. Strengthening word choices
                2. Converting passive to active voice
                3. Improving clarity and impact
                4. Ensuring logical flow
                5. Adding transitions where needed
                6. Maintaining original tone

                Only provide the enhanced text in the same language as the input.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.1986 9.94447C14.7649 9.5337 14.4859 8.98613 14.4085 8.39384L14.0056 5.31138L11.275 6.79724C10.7503 7.08274 10.1433 7.17888 9.55608 7.06948L6.49998 6.50015L7.06931 9.55625C7.17871 10.1435 7.08257 10.7505 6.79707 11.2751L5.31121 14.0057L8.39367 14.4086C8.98596 14.4861 9.53353 14.7651 9.94431 15.1987L12.0821 17.4557L13.4178 14.6486C13.6745 14.1092 14.109 13.6747 14.6484 13.418L17.4555 12.0823L15.1986 9.94447Z"/></svg>',
              title: 'improve-writing',
            },
            {
              prompt: `<content>{content}</content>
                Check for:
                1. Spelling errors
                2. Grammar mistakes 
                3. Punctuation
                4. Word usage
                5. Sentence structure
                6. Consistency

                Only provide the corrected text in the same language as the input.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.94 14.036c-.233.624-.43 1.2-.606 1.783.96-.697 2.101-1.139 3.418-1.304 2.513-.314 4.746-1.973 5.876-4.058l-1.456-1.455 1.413-1.415 1-1.001c.43-.43.915-1.224 1.428-2.368-5.593.867-9.018 4.292-11.074 9.818zM17 9.001L18 10c-1 3-4 6-8 6.5-2.669.334-4.336 2.167-5.002 5.5H3C4 16 6 2 21 2c-1 2.997-1.998 4.996-2.997 5.997L17 9.001z"/></svg>',
              title: 'Proofread',
            },
            {
              prompt: `<content>{content}</content>
                Make this text more concise by:
                1. Removing redundancies
                2. Using stronger verbs
                3. Eliminating unnecessary words
                4. Combining related ideas
                5. Maintaining key points

                Only provide the shortened text in the same language as the input.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>',
              title: 'make-shorter',
            },
            {
              prompt: `<content>{content}</content>
                Expand this text by:
                1. Adding relevant details
                2. Including examples
                3. Elaborating key points
                4. Providing context
                5. Maintaining flow

                Only provide the expanded text in the same language as the input.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
              title: 'make-longer',
            },
            {
              prompt: `<content>{content}</content>
                Make this text more professional by:
                1. Using formal language
                2. Adding technical terms
                3. Improving structure
                4. Enhancing precision
                5. Maintaining objectivity

                Only provide the professional version in the same language as the input.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 17h2v2H2v-2h2v-7a8 8 0 1 1 16 0v7zm-2 0v-7a6 6 0 1 0-12 0v7h12zm-9 4h6v2H9v-2z"/></svg>',
              title: 'Make Professional',
            },
            {
              prompt: `<content>{content}</content>
                Make this text more casual by:
                1. Using conversational tone
                2. Adding natural expressions
                3. Simplifying language
                4. Making it relatable
                5. Keeping it friendly

                Only provide the casual version in the same language as the input.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-7h2a3 3 0 0 0 6 0h2a5 5 0 0 1-10 0z"/></svg>',
              title: 'Make Casual',
            },
            '<hr/>',
            {
              prompt: `<content>{content}</content>
                Translate this text to ${lang}:
                1. Preserve meaning and context
                2. Maintain tone and style
                3. Adapt cultural references
                4. Keep formatting
                5. If the text is in ${lang} already, translate to Chinese. For all other languages, translate to ${lang}.
                Only provide the translated text without any other information.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 15v2a2 2 0 0 0 1.85 1.995L7 19h3v2H7a4 4 0 0 1-4-4v-2h2zm13-5l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16 10h2zm-1 2.885L15.753 16h2.492L17 12.885zM8 2v2h4v7H8v3H6v-3H2V4h4V2h2zm9 1a4 4 0 0 1 4 4v2h-2V7a2 2 0 0 0-2-2h-3V3h3zM6 6H4v3h2V6zm4 0H8v3h2V6z"/></svg>',
              title: 'translate',
            },
            {
              prompt: `<content>{content}</content>
                Summarize this text by:
                1. Extracting main ideas
                2. Identifying key points
                3. Maintaining context
                4. Preserving tone
                5. Being concise

                Only provide the summary in the same language as the input.`,
              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM7 6h4v4H7V6zm0 6h10v2H7v-2zm0 4h10v2H7v-2zm6-9h4v2h-4V7z"/></svg>',
              title: 'summarize',
            },
          ]
        },
        ...options,
      });

      aiEditorRef.current = aiEditor;
    }

    return () => {
      if (aiEditorRef.current) {
        aiEditorRef.current.destroy();
        aiEditorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(divRef.current);
      } else {
        ref.current = divRef.current;
      }
    }
  }, [ref]);

  useEffect(() => {
    if (aiEditorRef.current && value !== aiEditorRef.current.getMarkdown()) {
      aiEditorRef.current.setContent(value || "");
    }
  }, [value]);

  return <div ref={divRef} {...props} />;
});

export default AIEditor; 