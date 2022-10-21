import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetStaticPropsContext,
} from 'next'
import {
  getAllPostsForHome,
  getAllPostsWithSlug,
  getSinglePost,
} from '../lib/hygraph'

const DynamicPage = ({ post }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
      <h3 className="text-slate-900 dark:text-white mt-5 text-base font-medium tracking-tight">
        {post.title}
      </h3>
      <p
        className="text-slate-500 dark:text-slate-400 mt-2 text-sm"
        dangerouslySetInnerHTML={{ __html: post.content.html }}
      ></p>
    </div>
  )
}

export async function getStaticPaths() {
  const posts = await getAllPostsWithSlug()
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    // paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
    fallback: false, // can also be true or 'blocking'
  }
}

function serializeStaticProps(data: unknown) {
  return JSON.parse(JSON.stringify(data || null))
}

export async function getStaticProps(context: GetStaticPropsContext) {
  if (context?.params?.slug) {
    const post = await getSinglePost(context.params.slug)
    return { props: { ...serializeStaticProps(post) } }
  }
  return { props: {} }
}

export default DynamicPage
