<template>
  <div class="container" style="width:100%">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <UserProfileCard v-if="user && !edit" :user="user" />
        <UserProfileCardEditor v-else-if="user && edit" :user="user" />
        <div v-else>Loading...</div>
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead" v-if="user">{{ user.username }} recent activity </span>
        </div>
        <hr />
        <PostList v-if="user" :posts="user.posts" />
        <AppInfiniteScroll
          v-if="user"
          @load="fetchUserPosts"
          :done="user.posts.length === user.postsCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PostList from '@/components/PostList'
import UserProfileCard from '@/components/UserProfileCard'
import UserProfileCardEditor from '@/components/UserProfileCardEditor'
import { mapGetters } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  components: { PostList, UserProfileCard, UserProfileCardEditor },
  mixins: [asyncDataStatus],
  props: {
    edit: { type: Boolean, default: false }
  },
  computed: {
    ...mapGetters('auth', { user: 'authUser' }),
    lastPostFetched () {
      if (this.user && this.user.posts.length === 0) return null
      return this.user && this.user.posts[this.user.posts.length - 1]
    }
  },
  methods: {
    fetchUserPosts () {
      if (this.user) {
        return this.$store.dispatch('auth/fetchAuthUsersPosts', { startAfter: this.lastPostFetched })
      }
    }
  },
  async created () {
    if (this.user) {
      await this.fetchUserPosts()
      this.asyncDataStatus_fetched()
    }
  }
}
</script>
