import { defineField, defineType } from 'sanity'

export const eventType = defineType({
    name: 'event',
    title: 'Мероприятия',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Заголовок',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'badge',
            title: 'Бейдж (например, Еженедельно)',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'dateBadge',
            title: 'Бейдж формата (например, Мастермайнд)',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Описание',
            type: 'text',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Изображение',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'isGradient',
            title: 'Использовать градиент вместо фото',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'gradientColors',
            title: 'Цвета градиента',
            type: 'string',
            description: 'Например: #1a0a0a 0%, #2a1515 100%',
            hidden: ({ document }) => !document?.isGradient,
        }),
        defineField({
            name: 'emojiIcon',
            title: 'Эмодзи или иконка (для градиентного фона)',
            type: 'string',
            hidden: ({ document }) => !document?.isGradient,
        }),
        defineField({
            name: 'location',
            title: 'Локация (📍)',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'capacity',
            title: 'Вместимость / Детали (👥 или 🍷)',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'order',
            title: 'Порядок сортировки',
            type: 'number',
            initialValue: 0,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'image',
            subtitle: 'badge',
        },
    },
})
