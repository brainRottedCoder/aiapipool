import { z } from "zod";
export declare const MessageSchema: z.ZodObject<{
    role: z.ZodEnum<["system", "user", "assistant"]>;
    content: z.ZodString;
}, "strict", z.ZodTypeAny, {
    content: string;
    role: "user" | "system" | "assistant";
}, {
    content: string;
    role: "user" | "system" | "assistant";
}>;
export declare const OpenAIChatRequestSchema: z.ZodObject<{
    model: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant"]>;
        content: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        content: string;
        role: "user" | "system" | "assistant";
    }, {
        content: string;
        role: "user" | "system" | "assistant";
    }>, "many">;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    temperature: z.ZodOptional<z.ZodNumber>;
    max_tokens: z.ZodOptional<z.ZodNumber>;
    top_p: z.ZodOptional<z.ZodNumber>;
    frequency_penalty: z.ZodOptional<z.ZodNumber>;
    presence_penalty: z.ZodOptional<z.ZodNumber>;
    stop: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strict", z.ZodTypeAny, {
    stream: boolean;
    model: string;
    messages: {
        content: string;
        role: "user" | "system" | "assistant";
    }[];
    temperature?: number | undefined;
    max_tokens?: number | undefined;
    top_p?: number | undefined;
    frequency_penalty?: number | undefined;
    presence_penalty?: number | undefined;
    stop?: string | string[] | undefined;
}, {
    model: string;
    messages: {
        content: string;
        role: "user" | "system" | "assistant";
    }[];
    stream?: boolean | undefined;
    temperature?: number | undefined;
    max_tokens?: number | undefined;
    top_p?: number | undefined;
    frequency_penalty?: number | undefined;
    presence_penalty?: number | undefined;
    stop?: string | string[] | undefined;
}>;
export declare const OpenAIChatResponseSchema: z.ZodObject<{
    id: z.ZodString;
    object: z.ZodLiteral<"chat.completion">;
    created: z.ZodNumber;
    model: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        message: z.ZodObject<{
            role: z.ZodEnum<["system", "user", "assistant"]>;
            content: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            content: string;
            role: "user" | "system" | "assistant";
        }, {
            content: string;
            role: "user" | "system" | "assistant";
        }>;
        finish_reason: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: {
            content: string;
            role: "user" | "system" | "assistant";
        };
        index: number;
        finish_reason: string | null;
    }, {
        message: {
            content: string;
            role: "user" | "system" | "assistant";
        };
        index: number;
        finish_reason: string | null;
    }>, "many">;
    usage: z.ZodObject<{
        prompt_tokens: z.ZodNumber;
        completion_tokens: z.ZodNumber;
        total_tokens: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }, {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }>;
}, "strict", z.ZodTypeAny, {
    object: "chat.completion";
    id: string;
    model: string;
    created: number;
    choices: {
        message: {
            content: string;
            role: "user" | "system" | "assistant";
        };
        index: number;
        finish_reason: string | null;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}, {
    object: "chat.completion";
    id: string;
    model: string;
    created: number;
    choices: {
        message: {
            content: string;
            role: "user" | "system" | "assistant";
        };
        index: number;
        finish_reason: string | null;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}>;
export declare const OpenAIStreamChunkSchema: z.ZodObject<{
    id: z.ZodString;
    object: z.ZodLiteral<"chat.completion.chunk">;
    created: z.ZodNumber;
    model: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        delta: z.ZodObject<{
            role: z.ZodOptional<z.ZodEnum<["system", "user", "assistant"]>>;
            content: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            content?: string | undefined;
            role?: "user" | "system" | "assistant" | undefined;
        }, {
            content?: string | undefined;
            role?: "user" | "system" | "assistant" | undefined;
        }>;
        finish_reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        index: number;
        delta: {
            content?: string | undefined;
            role?: "user" | "system" | "assistant" | undefined;
        };
        finish_reason?: string | null | undefined;
    }, {
        index: number;
        delta: {
            content?: string | undefined;
            role?: "user" | "system" | "assistant" | undefined;
        };
        finish_reason?: string | null | undefined;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    object: "chat.completion.chunk";
    id: string;
    model: string;
    created: number;
    choices: {
        index: number;
        delta: {
            content?: string | undefined;
            role?: "user" | "system" | "assistant" | undefined;
        };
        finish_reason?: string | null | undefined;
    }[];
}, {
    object: "chat.completion.chunk";
    id: string;
    model: string;
    created: number;
    choices: {
        index: number;
        delta: {
            content?: string | undefined;
            role?: "user" | "system" | "assistant" | undefined;
        };
        finish_reason?: string | null | undefined;
    }[];
}>;
//# sourceMappingURL=schemas.d.ts.map