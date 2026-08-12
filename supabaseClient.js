import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xvzocwcchjdiyudrqorq.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2em9jd2NjaGpkaXl1ZHJxb3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyOTQzOTYsImV4cCI6MjEwMTg3MDM5Nn0.2xG_Xqd0WDZEtuZAnWXJmjedlde2Omb-9JshXMVGFGs';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/**
 * Authenticates an administrator or staff member.
 */
export async function loginStaff(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        await supabase.auth.signOut();
        throw new Error(
            'Unable to load staff profile: ' + profileError.message
        );
    }

    if (!profile) {
        await supabase.auth.signOut();
        throw new Error(
            'Access denied. User profile not found.'
        );
    }

    if (!profile.active) {
        await supabase.auth.signOut();
        throw new Error(
            'Access denied. User profile is inactive.'
        );
    }

    return {
        session: data.session,
        profile
    };
}


/**
 * Logs out the current user and redirects to login.
 */
export async function logoutStaff() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}


/**
 * Secures admin/staff pages.
 */
export async function requireAuth() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error || !session) {
        window.location.href = 'login.html';
        return null;
    }

    const {
        data: profile,
        error: profileError
    } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (profileError) {
        console.error(
            'Profile lookup failed:',
            profileError.message
        );

        alert(
            'Unable to load your staff profile: ' +
            profileError.message
        );

        await supabase.auth.signOut();
        window.location.href = 'login.html';

        return null;
    }

    if (!profile || !profile.active) {
        alert('Unauthorized or inactive account.');

        await supabase.auth.signOut();
        window.location.href = 'login.html';

        return null;
    }

    const allowedRoles = [
        'STAFF',
        'INSPECTOR',
        'SALES',
        'ADMIN',
        'SUPER_ADMIN'
    ];

    if (!allowedRoles.includes(profile.role)) {
        alert('Unauthorized role: ' + profile.role);

        await supabase.auth.signOut();
        window.location.href = 'login.html';

        return null;
    }

    return {
        session,
        profile
    };
}import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL =
    'https://xvzocwcchjdiyudrqorq.supabase.co';

const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI6Inh2em9jd2NjaXl1ZHJxb3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyOTQzOTYsImV4cCI6MjEwMTg3MDM5Nn0.2xG_Xqd0WDZEtuZAnWXJmjedlde2Omb-9JshXMVGFGs';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);


/**
 * Authenticates an administrator, inspector, sales
 * staff member, or other active staff account.
 */
export async function loginStaff(email, password) {

    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    if (!data?.user) {
        throw new Error('Login succeeded but no authenticated user was returned.');
    }

    const {
        data: profile,
        error: profileError
    } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        await supabase.auth.signOut();

        throw new Error(
            `Unable to load staff profile: ${profileError.message}`
        );
    }

    if (!profile) {
        await supabase.auth.signOut();

        throw new Error(
            'Access denied. No staff profile exists for this account.'
        );
    }

    if (!profile.active) {
        await supabase.auth.signOut();

        throw new Error(
            'Access denied. This staff account is inactive.'
        );
    }

    return {
        session: data.session,
        profile
    };
}


/**
 * Logs out the current user and redirects to login.
 */
export async function logoutStaff() {

    const { error } =
        await supabase.auth.signOut();

    if (error) {
        console.error(
            'Logout error:',
            error.message
        );
    }

    window.location.href = 'login.html';
}


/**
 * Secures admin/staff pages.
 */
export async function requireAuth() {

    /*
     * Ask Supabase Auth for the authenticated user.
     * This verifies the current authenticated identity.
     */
    const {
        data: {
            user
        },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {

        console.error(
            'Authentication check failed:',
            userError?.message || 'No authenticated user'
        );

        window.location.href = 'login.html';

        return null;
    }


    /*
     * Load the corresponding public.users profile.
     */
    const {
        data: profile,
        error: profileError
    } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();


    if (profileError) {

        console.error(
            'Staff profile lookup failed:',
            profileError.message
        );

        alert(
            'Unable to load your staff profile: ' +
            profileError.message
        );

        await supabase.auth.signOut();

        window.location.href = 'login.html';

        return null;
    }


    if (!profile) {

        alert(
            'Access denied. No staff profile was found for this account.'
        );

        await supabase.auth.signOut();

        window.location.href = 'login.html';

        return null;
    }


    if (!profile.active) {

        alert(
            'This staff account is inactive.'
        );

        await supabase.auth.signOut();

        window.location.href = 'login.html';

        return null;
    }


    /*
     * These are the actual enum values confirmed
     * from your database.
     */
    const allowedRoles = [
        'STAFF',
        'INSPECTOR',
        'SALES',
        'ADMIN',
        'SUPER_ADMIN'
    ];


    if (!allowedRoles.includes(profile.role)) {

        alert(
            'Unauthorized role: ' +
            profile.role
        );

        await supabase.auth.signOut();

        window.location.href = 'login.html';

        return null;
    }


    return {
        session: {
            user
        },
        profile
    };
}
