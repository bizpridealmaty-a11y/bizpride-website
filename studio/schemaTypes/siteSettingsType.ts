import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
    name: 'siteSettings',
    title: 'Настройки сайта',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Название сайта',
            type: 'string',
            initialValue: 'BizPride',
        }),
        defineField({
            name: 'phone',
            title: 'Номер телефона',
            type: 'string',
        }),
        defineField({
            name: 'instagram',
            title: 'Instagram URL',
            type: 'url',
        }),
        defineField({
            name: 'telegram',
            title: 'Telegram URL',
            type: 'url',
        }),
        defineField({
            name: 'youtube',
            title: 'YouTube URL',
            type: 'url',
        }),
        defineField({
            name: 'whatsappCounter',
            title: 'Счетчик резидентов (например 120)',
            type: 'number',
        }),
    ],
})
