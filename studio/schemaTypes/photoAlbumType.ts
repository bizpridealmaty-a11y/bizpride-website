import { defineField, defineType } from 'sanity'

export const photoAlbumType = defineType({
    name: 'photoAlbum',
    title: 'Фотоальбомы',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Название альбома',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Дата мероприятия',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'photoCount',
            title: 'Количество фото (текст, например "120 фото")',
            type: 'string',
        }),
        defineField({
            name: 'coverImage',
            title: 'Обложка альбома',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'googleDriveLink',
            title: 'Ссылка на Google Drive (если есть)',
            type: 'url',
            description: 'Если указана ссылка, клик по альбому откроет эту ссылку.',
        }),
        defineField({
            name: 'photos',
            title: 'Фотографии (если загружать прямо на сайт)',
            type: 'array',
            of: [{ type: 'image' }],
            description: 'Загрузите фотографии сюда, если хотите показывать их на сайте, а не в Google Drive.',
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
            media: 'coverImage',
            subtitle: 'date',
        },
    },
})
