import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ujicfqdoznztlgizdhzn.supabase.co";
const SUPABASE_KEY = "sb_publishable_C73EN3Ewci3-yHeOvnwxuw_3xr_lBgQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const APP_STATE_ID = "home-budget-stock";
