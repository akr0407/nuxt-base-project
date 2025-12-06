import { generateOpenAPIDocument } from '../utils/openapi'

export default defineEventHandler(() => {
    const document = generateOpenAPIDocument()
    return document
})
