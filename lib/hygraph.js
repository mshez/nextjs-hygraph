import { request, gql, GraphQLClient } from 'graphql-request'

const graphqlAPI = process.env.GRAPHCMS_PROJECT_API

const hygraph = new GraphQLClient(graphqlAPI, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.GRAPHCMS_PROD_AUTH_TOKEN}`,
  },
})

export async function getPreviewPostBySlug(slug) {
  const data = await hygraph.request(
    `
    query PostBySlug($slug: String!, $stage: Stage!) {
      post(where: {slug: $slug}, stage: $stage) {
        slug
      }
    }`,
    {
      preview: true,
      variables: {
        stage: 'DRAFT',
        slug,
      },
    }
  )
  return data.post
}

export async function getAllPostsWithSlug() {
  const data = await hygraph.request(`
    {
      posts {
        slug
      }
    }
  `)
  return data.posts
}

export async function getSinglePost(slug) {
  const query = gql`
    query getPost($slug: String!) {
      post(where: { slug: $slug }) {
        id
        title
        content {
          html
        }
        comment {
          name
          email
          comment
        }
      }
    }
  `

  const data = await hygraph.request(query, { slug })
  return data
}

export async function getAllPostsForHome(preview) {
  const data = await hygraph.request(
    `
    {
      posts(orderBy: date_DESC, first: 20) {
        title
        slug
        excerpt
        date
        coverImage {
          url(transformation: {
            image: {
              resize: {
                fit:crop,
                width:2000,
                height:1000
              }
            }
          })
        }
        author {
          name
          picture {
            url(transformation: {
              image: {
                resize: {
                  width:100,
                  height:100,
                  fit:crop
                }
              }
            })
          }
        }
      }
    }
  `,
    { preview }
  )
  return data.posts
}

export async function getPostAndMorePosts(slug, preview) {
  return await hygraph.request(
    `
    query PostBySlug($slug: String!, $stage: Stage!) {
      post(stage: $stage, where: {slug: $slug}) {
        title
        slug
        content {
          html
        }
        date
        ogImage: coverImage {
          url(transformation: {image: {resize: {fit: crop, width: 2000, height: 1000}}})
        }
        coverImage {
          url(transformation: {image: {resize: {fit: crop, width: 2000, height: 1000}}})
        }
        author {
          name
          picture {
            url(transformation: {image: {resize: {fit: crop, width: 100, height: 100}}})
          }
        }
      }
      morePosts: posts(orderBy: date_DESC, first: 2, where: {slug_not_in: [$slug]}) {
        title
        slug
        excerpt
        date
        coverImage {
          url(transformation: {image: {resize: {fit: crop, width: 2000, height: 1000}}})
        }
        author {
          name
          picture {
            url(transformation: {image: {resize: {fit: crop, width: 100, height: 100}}})
          }
        }
      }
    }
  `,
    {
      preview,
      variables: {
        stage: preview ? 'DRAFT' : 'PUBLISHED',
        slug,
      },
    }
  )
}

export const submitComment = async (obj) => {
  const result = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  })
  return result.json()
}

export const getComments = async (slug) => {
  const query = gql`
    query GetComments($slug: String!) {
      comments(where: { post: { slug: $slug } }) {
        name
        createdAt
        comment
      }
    }
  `
  const result = await request(graphqlAPI, query, { slug })
  return result.comments
}
